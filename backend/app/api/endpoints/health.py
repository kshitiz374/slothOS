from fastapi import APIRouter
from app.config import settings
from app.database import get_db
from app.models.schemas import HealthResponse, ModelInfo, SwitchModelRequest, StatsResponse
from app.services.ollama_client import ollama_client

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def get_health():
    check = await ollama_client.check_health()
    raw_models = check.get("models", [])
    models_info = []
    for m in raw_models:
        size_b = m.get("size", 0)
        size_gb = f"{size_b / (1024**3):.1f} GB" if size_b > 0 else "Unknown"
        models_info.append(ModelInfo(
            name=m.get("name", "unknown"),
            size=size_gb,
            modified_at=m.get("modified_at", ""),
            details=m.get("details", {})
        ))

    return HealthResponse(
        status="healthy",
        app_version=settings.version,
        ollama_online=check["online"],
        active_model=check.get("active_model", settings.default_model),
        available_models=models_info,
        latency_ms=check.get("latency_ms"),
        privacy_mode="100% Local-First Inference (Zero Cloud Leaks)"
    )

@router.post("/models/switch")
async def switch_model(req: SwitchModelRequest):
    ollama_client.set_active_model(req.model_name)
    return {"success": True, "active_model": req.model_name}

@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*), COALESCE(SUM(estimated_seconds_saved), 0) FROM task_history WHERE status = 'completed'")
        comp_row = cursor.fetchone()
        tasks_completed = comp_row[0] if comp_row else 0
        seconds_saved = comp_row[1] if comp_row else 0

        cursor.execute("SELECT COUNT(*) FROM undo_manifests WHERE reverted = 0")
        files_row = cursor.fetchone()
        files_organized = files_row[0] if files_row else 0

        cursor.execute("SELECT COUNT(*) FROM autopilot_queue WHERE status = 'suggested'")
        pend_row = cursor.fetchone()
        pending_actions = pend_row[0] if pend_row else 0

    check = await ollama_client.check_health()
    return StatsResponse(
        tasks_completed=tasks_completed,
        estimated_minutes_saved=round(seconds_saved / 60),
        files_organized=files_organized,
        pending_actions=pending_actions,
        active_model=check.get("active_model", settings.default_model),
        ollama_online=check["online"]
    )
