import os
import shutil
import uuid
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import json
import logging

from app.config import settings
from app.database import get_db
from app.models.schemas import FileInfo, ProposedFileAction, ScanFolderResponse
from app.services.ollama_client import ollama_client
from app.services.fallback_engine import fallback_engine

logger = logging.getLogger(__name__)

class FileOrganizerService:
    @staticmethod
    def validate_path_sandbox(folder_path: str) -> Path:
        """
        Validates that the folder path exists and is a directory.
        Checks for path traversal attempts and ensures directory is within allowed bounds.
        """
        if not folder_path or not folder_path.strip():
            raise ValueError("Folder path cannot be empty")

        path = Path(folder_path).resolve()
        if not path.exists():
            raise ValueError(f"Path does not exist: {path}")
        if not path.is_dir():
            raise ValueError(f"Path is not a directory: {path}")

        # Block root drive dangerous manipulations
        parts = path.parts
        if len(parts) <= 1:
            raise ValueError("Direct access to drive root is restricted for safety")

        # Disallow system directories
        lowered = str(path).lower()
        forbidden = ["windows", "system32", "program files", "etc", "boot", "bin", "sbin", "usr"]
        for f in forbidden:
            if f in lowered and (len(parts) <= 3):
                raise ValueError(f"Safety restriction: Cannot organize critical system folder '{f}'")

        return path

    @staticmethod
    def format_size(bytes_val: int) -> str:
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if bytes_val < 1024.0:
                return f"{bytes_val:.1f} {unit}"
            bytes_val /= 1024.0
        return f"{bytes_val:.1f} PB"

    @classmethod
    def scan_folder(cls, folder_path: str, recursive: bool = False) -> ScanFolderResponse:
        validated_dir = cls.validate_path_sandbox(folder_path)
        
        file_items: List[FileInfo] = []
        total_bytes = 0

        iterator = validated_dir.rglob("*") if recursive else validated_dir.iterdir()

        for item in iterator:
            try:
                # Skip hidden files like .DS_Store, .git, etc.
                if item.name.startswith("."):
                    continue
                if item.is_file():
                    stat = item.stat()
                    size_bytes = stat.st_size
                    total_bytes += size_bytes
                    mod_time = datetime.datetime.fromtimestamp(stat.st_mtime).isoformat()
                    
                    file_items.append(FileInfo(
                        path=str(item),
                        filename=item.name,
                        extension=item.suffix.lower(),
                        size_bytes=size_bytes,
                        size_readable=cls.format_size(size_bytes),
                        modified_at=mod_time,
                        is_directory=False
                    ))
            except (PermissionError, FileNotFoundError) as e:
                logger.warning(f"Could not read file {item}: {e}")
                continue

        return ScanFolderResponse(
            folder_path=str(validated_dir),
            total_files=len(file_items),
            total_bytes=total_bytes,
            total_readable=cls.format_size(total_bytes),
            files=file_items
        )

    @classmethod
    def resolve_collision(cls, target_dir: Path, filename: str) -> Path:
        """Finds non-conflicting filename by appending numeric suffixes if file exists."""
        target_path = target_dir / filename
        if not target_path.exists():
            return target_path

        base = target_path.stem
        ext = target_path.suffix
        counter = 1
        while True:
            candidate = target_dir / f"{base}_{counter}{ext}"
            if not candidate.exists():
                return candidate
            counter += 1

    @classmethod
    async def propose_organization(cls, folder_path: str, selected_files: Optional[List[str]] = None) -> Dict[str, Any]:
        validated_dir = cls.validate_path_sandbox(folder_path)
        scan = cls.scan_folder(str(validated_dir))
        
        files_to_process = scan.files
        if selected_files:
            files_to_process = [f for f in scan.files if f.path in selected_files]

        if not files_to_process:
            return {
                "folder_path": str(validated_dir),
                "total_proposed": 0,
                "proposals": [],
                "used_ai": False,
                "model_name": "None"
            }

        # Check if Ollama is available
        health = await ollama_client.check_health()
        proposals: List[ProposedFileAction] = []
        used_ai = False
        model_name = "Deterministic Rule-based Fallback"

        if health["online"]:
            try:
                # Prepare prompt for Ollama
                file_names = [f.filename for f in files_to_process[:40]] # batch up to 40 files
                prompt = f"""
You are a smart file organization assistant.
Analyze these file names:
{json.dumps(file_names)}

For each file, determine:
1. category: Choose exactly one from ["Documents", "Code", "Images", "Academic", "Finance", "Miscellaneous"]
2. suggested_filename: A clean, clear, standard filename with extension preserved (remove messy tags like draft_v2, temp, dsc0921, replace noisy underscores with clean title case or clean underscores).
3. reason: A brief 3-8 word explanation of why this category/name fits.

Return ONLY a JSON array of objects with keys: "original_filename", "category", "suggested_filename", "reason".
"""
                system = "You are SlothOS File Organizer. Output strict JSON only without markdown codeblocks or preamble."
                ai_result = await ollama_client.generate_json(prompt, system_prompt=system, timeout=25.0)
                
                # Check if result is a list or wrapped in an object
                plan_list = None
                if isinstance(ai_result, list):
                    plan_list = ai_result
                elif isinstance(ai_result, dict):
                    # sometimes models wrap in {"files": [...]} or similar
                    for v in ai_result.values():
                        if isinstance(v, list):
                            plan_list = v
                            break

                if plan_list:
                    mapping = {item.get("original_filename", ""): item for item in plan_list}
                    for f in files_to_process:
                        orig = f.filename
                        match = mapping.get(orig)
                        if match:
                            cat = match.get("category", "Miscellaneous")
                            if cat not in ["Documents", "Code", "Images", "Academic", "Finance", "Miscellaneous"]:
                                cat = "Miscellaneous"
                            sug_name = match.get("suggested_filename") or orig
                            reason = match.get("reason", "Categorized by AI")
                            
                            cat_dir = validated_dir / cat
                            tentative_target = cat_dir / sug_name
                            is_conflict = tentative_target.exists()
                            resolved = cls.resolve_collision(cat_dir, sug_name)
                            
                            proposals.append(ProposedFileAction(
                                original_path=f.path,
                                original_filename=orig,
                                suggested_category=cat,
                                suggested_filename=sug_name,
                                target_path=str(tentative_target),
                                reason=reason,
                                confidence=0.92,
                                is_conflict=is_conflict,
                                resolved_target_path=str(resolved)
                            ))
                    if proposals:
                        used_ai = True
                        model_name = health.get("active_model", settings.default_model)
            except Exception as e:
                logger.warning(f"AI proposal generation failed, falling back to heuristics: {e}")
                proposals = []

        # Fallback if AI was unavailable or returned empty
        if not proposals:
            for f in files_to_process:
                heuristic = fallback_engine.classify_file(f.filename)
                cat = heuristic["category"]
                sug_name = heuristic["suggested_filename"]
                reason = heuristic["reason"]
                
                cat_dir = validated_dir / cat
                tentative_target = cat_dir / sug_name
                is_conflict = tentative_target.exists()
                resolved = cls.resolve_collision(cat_dir, sug_name)
                
                proposals.append(ProposedFileAction(
                    original_path=f.path,
                    original_filename=f.filename,
                    suggested_category=cat,
                    suggested_filename=sug_name,
                    target_path=str(tentative_target),
                    reason=reason,
                    confidence=heuristic["confidence"],
                    is_conflict=is_conflict,
                    resolved_target_path=str(resolved)
                ))

        return {
            "folder_path": str(validated_dir),
            "total_proposed": len(proposals),
            "proposals": proposals,
            "used_ai": used_ai,
            "model_name": model_name
        }

    @classmethod
    def execute_organization(cls, folder_path: str, proposals: List[ProposedFileAction], dry_run: bool = False) -> Dict[str, Any]:
        validated_dir = cls.validate_path_sandbox(folder_path)
        task_id = str(uuid.uuid4())
        results = []
        success_count = 0
        failed_count = 0
        time_saved_seconds = len(proposals) * 45 # approx 45 seconds per file manual sort

        if dry_run:
            for p in proposals:
                results.append({
                    "original_path": p.original_path,
                    "target_path": p.resolved_target_path,
                    "status": "simulated_success",
                    "category": p.suggested_category
                })
            return {
                "task_id": f"dry_run_{task_id}",
                "dry_run": True,
                "success_count": len(proposals),
                "failed_count": 0,
                "results": results,
                "undo_available": False
            }

        with get_db() as conn:
            cursor = conn.cursor()
            
            # Record task
            cursor.execute("""
                INSERT INTO task_history (id, task_type, title, description, status, estimated_seconds_saved, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                task_id,
                "file_organize",
                f"Organized {len(proposals)} files in {validated_dir.name}",
                f"Moved files into categorized folders ({len(proposals)} planned)",
                "in_progress",
                time_saved_seconds,
                json.dumps({"folder": str(validated_dir), "count": len(proposals)})
            ))

            for p in proposals:
                orig_file = Path(p.original_path).resolve()
                dest_file = Path(p.resolved_target_path).resolve()

                # Safety checks: ensure source and dest are within sandboxed folder
                try:
                    if not str(orig_file).startswith(str(validated_dir)):
                        raise ValueError(f"Path traversal check failed: {orig_file} is outside {validated_dir}")
                    if not str(dest_file).startswith(str(validated_dir)):
                        raise ValueError(f"Path traversal check failed: {dest_file} is outside {validated_dir}")

                    if not orig_file.exists():
                        raise FileNotFoundError(f"Source file not found: {orig_file}")

                    # Create parent category directory if needed
                    dest_file.parent.mkdir(parents=True, exist_ok=True)

                    # Move file safely
                    shutil.move(str(orig_file), str(dest_file))

                    # Insert into undo manifests
                    cursor.execute("""
                        INSERT INTO undo_manifests (task_id, original_path, new_path, category, operation_type, reverted)
                        VALUES (?, ?, ?, ?, ?, 0)
                    """, (task_id, str(orig_file), str(dest_file), p.suggested_category, "move"))

                    results.append({
                        "original_path": str(orig_file),
                        "target_path": str(dest_file),
                        "status": "success",
                        "category": p.suggested_category
                    })
                    success_count += 1
                except Exception as e:
                    logger.error(f"Failed to move {orig_file} to {dest_file}: {e}")
                    results.append({
                        "original_path": str(orig_file),
                        "target_path": str(dest_file),
                        "status": "failed",
                        "error": str(e)
                    })
                    failed_count += 1

            # Update task status
            final_status = "completed" if failed_count == 0 else ("partial" if success_count > 0 else "failed")
            cursor.execute("UPDATE task_history SET status = ? WHERE id = ?", (final_status, task_id))
            conn.commit()

        return {
            "task_id": task_id,
            "dry_run": False,
            "success_count": success_count,
            "failed_count": failed_count,
            "results": results,
            "undo_available": success_count > 0
        }

file_organizer = FileOrganizerService()
