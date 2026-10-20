import uuid
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.config import settings, WORKSPACE_ROOT
from app.database import get_db
from app.models.schemas import AutopilotTask
from app.services.file_organizer import file_organizer
from app.services.briefing_service import briefing_service

logger = logging.getLogger(__name__)

class AutopilotService:
    @classmethod
    def seed_default_suggestions(cls, workspace_folder: Optional[str] = None):
        """Generates realistic low-effort automation suggestions for the queue."""
        demo_folder = str(WORKSPACE_ROOT / "demo_workspace" / "Messy_Downloads")
        notes_folder = str(WORKSPACE_ROOT / "demo_workspace" / "Notes_and_Chats")
        
        default_items = [
            {
                "id": "auto_task_clean_downloads",
                "title": "Clean Cluttered Downloads Folder",
                "description": f"Scan {Path(demo_folder).name} and categorize loose receipts, code, and PDFs into tidy subfolders.",
                "category": "File Hygiene",
                "action_type": "organize_folder",
                "payload": {"folder_path": demo_folder},
                "status": "suggested"
            },
            {
                "id": "auto_task_morning_digest",
                "title": "Synthesize Weekly Chat & Meeting Digest",
                "description": f"Extract the top 5 action items and deadlines from {Path(notes_folder).name} without reading 300 chat lines.",
                "category": "Briefing",
                "action_type": "generate_briefing",
                "payload": {"folder_path": notes_folder},
                "status": "suggested"
            },
            {
                "id": "auto_task_invoice_tagging",
                "title": "Standardize Financial Invoices",
                "description": "Detect messy invoice numbers in receipts and add standard YYYY-MM prefixes for tax peace of mind.",
                "category": "Finance",
                "action_type": "organize_folder",
                "payload": {"folder_path": demo_folder},
                "status": "suggested"
            }
        ]

        with get_db() as conn:
            cursor = conn.cursor()
            for item in default_items:
                cursor.execute("""
                    INSERT OR IGNORE INTO autopilot_queue (id, title, description, category, action_type, payload_json, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    item["id"],
                    item["title"],
                    item["description"],
                    item["category"],
                    item["action_type"],
                    json.dumps(item["payload"]),
                    item["status"]
                ))
            conn.commit()

    @classmethod
    def get_queue(cls) -> Dict[str, Any]:
        cls.seed_default_suggestions()
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, title, description, category, action_type, payload_json, status, created_at
                FROM autopilot_queue
                ORDER BY created_at DESC
            """)
            rows = cursor.fetchall()
            tasks = []
            pending_count = 0
            for r in rows:
                if r["status"] == "suggested":
                    pending_count += 1
                tasks.append(AutopilotTask(
                    id=r["id"],
                    title=r["title"],
                    description=r["description"],
                    category=r["category"],
                    action_type=r["action_type"],
                    payload=json.loads(r["payload_json"]),
                    status=r["status"],
                    created_at=str(r["created_at"])
                ))
            return {
                "tasks": tasks,
                "pending_count": pending_count
            }

    @classmethod
    async def update_task(cls, task_id: str, action: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, action_type, payload_json, status FROM autopilot_queue WHERE id = ?", (task_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Autopilot task {task_id} not found")

            if action == "reject":
                cursor.execute("UPDATE autopilot_queue SET status = 'rejected' WHERE id = ?", (task_id,))
                conn.commit()
                return {"task_id": task_id, "status": "rejected", "message": "Task dismissed by user."}

            if action == "approve" or action == "execute":
                cursor.execute("UPDATE autopilot_queue SET status = 'completed' WHERE id = ?", (task_id,))
                
                # Execute the specific safe task
                action_type = row["action_type"]
                payload = json.loads(row["payload_json"])
                result_payload = {}

                if action_type == "organize_folder":
                    folder_path = payload.get("folder_path")
                    # Scan and propose
                    proposals_res = await file_organizer.propose_organization(folder_path)
                    exec_res = file_organizer.execute_organization(folder_path, proposals_res["proposals"])
                    result_payload = exec_res
                elif action_type == "generate_briefing":
                    folder_path = payload.get("folder_path")
                    files = [str(f) for f in Path(folder_path).glob("*.*") if f.is_file()]
                    brief_res = await briefing_service.generate_briefing(file_paths=files)
                    result_payload = brief_res

                conn.commit()
                return {
                    "task_id": task_id,
                    "status": "completed",
                    "message": f"Successfully executed {row['title']}",
                    "result": result_payload
                }

        raise ValueError(f"Unknown action {action}")

autopilot_service = AutopilotService()
