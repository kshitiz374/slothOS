import json
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.schemas import ActivityHistoryResponse, TaskHistoryItem

router = APIRouter()

@router.get("", response_model=ActivityHistoryResponse)
def get_activity_history():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, task_type, title, description, status, estimated_seconds_saved, created_at, metadata_json
            FROM task_history
            ORDER BY created_at DESC
            LIMIT 100
        """)
        rows = cursor.fetchall()
        items = []
        for r in rows:
            meta = None
            if r["metadata_json"]:
                try:
                    meta = json.loads(r["metadata_json"])
                except Exception:
                    pass
            items.append(TaskHistoryItem(
                id=r["id"],
                task_type=r["task_type"],
                title=r["title"],
                description=r["description"],
                status=r["status"],
                estimated_seconds_saved=r["estimated_seconds_saved"],
                created_at=str(r["created_at"]),
                metadata=meta
            ))
        return ActivityHistoryResponse(history=items)

@router.delete("/clear")
def clear_history():
    """Privacy feature: Permanently purges local activity log and undo records."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM undo_manifests")
        cursor.execute("DELETE FROM task_history")
        cursor.execute("UPDATE autopilot_queue SET status = 'suggested' WHERE status = 'completed'")
        conn.commit()
    return {"success": True, "message": "All local activity history and manifests successfully wiped."}
