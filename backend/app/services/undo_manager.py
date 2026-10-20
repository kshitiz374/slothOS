import os
import shutil
from pathlib import Path
from typing import Optional, Dict, Any, List
import logging
from app.database import get_db

logger = logging.getLogger(__name__)

class UndoManagerService:
    @staticmethod
    def revert_task(task_id: Optional[str] = None) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()

            # Find target task_id if not specified
            if not task_id:
                cursor.execute("""
                    SELECT task_id FROM undo_manifests
                    WHERE reverted = 0
                    ORDER BY id DESC
                    LIMIT 1
                """)
                row = cursor.fetchone()
                if not row:
                    return {"success": False, "reverted_count": 0, "errors": ["No active undo operations found."]}
                task_id = row["task_id"]

            cursor.execute("""
                SELECT id, original_path, new_path, category FROM undo_manifests
                WHERE task_id = ? AND reverted = 0
                ORDER BY id DESC
            """, (task_id,))
            manifest_items = cursor.fetchall()

            if not manifest_items:
                return {"success": False, "reverted_count": 0, "errors": [f"No pending file operations to revert for task {task_id}."]}

            reverted_count = 0
            errors = []
            folders_to_check = set()

            for item in manifest_items:
                manifest_id = item["id"]
                orig_path = Path(item["original_path"])
                current_path = Path(item["new_path"])

                try:
                    if not current_path.exists():
                        errors.append(f"Cannot revert: File missing from {current_path}")
                        continue

                    # Ensure original folder exists
                    orig_path.parent.mkdir(parents=True, exist_ok=True)

                    # Move file back
                    shutil.move(str(current_path), str(orig_path))
                    
                    # Track parent category folder to clean if empty
                    folders_to_check.add(current_path.parent)

                    # Mark reverted
                    cursor.execute("UPDATE undo_manifests SET reverted = 1 WHERE id = ?", (manifest_id,))
                    reverted_count += 1
                except Exception as e:
                    logger.error(f"Failed to revert {current_path} -> {orig_path}: {e}")
                    errors.append(f"Error restoring {current_path.name}: {str(e)}")

            # Clean up empty category subdirectories
            for folder in folders_to_check:
                try:
                    if folder.exists() and folder.is_dir():
                        # If folder has no items left, remove it
                        if not any(folder.iterdir()):
                            folder.rmdir()
                except Exception as e:
                    logger.debug(f"Could not remove folder {folder}: {e}")

            # Update task status in task_history
            cursor.execute("UPDATE task_history SET status = 'reverted' WHERE id = ?", (task_id,))
            conn.commit()

            return {
                "success": reverted_count > 0,
                "reverted_count": reverted_count,
                "errors": errors
            }

undo_manager = UndoManagerService()
