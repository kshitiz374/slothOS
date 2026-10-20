from fastapi import APIRouter
from app.api.endpoints import health, files, briefing, crusher, documents, autopilot, history

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Models"])
api_router.include_router(files.router, prefix="/files", tags=["Sloth Inbox File Cleaner"])
api_router.include_router(briefing.router, prefix="/briefing", tags=["Lazy Morning Briefing"])
api_router.include_router(crusher.router, prefix="/crusher", tags=["Procrastination Crusher"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Assistant"])
api_router.include_router(autopilot.router, prefix="/autopilot", tags=["Sloth Autopilot"])
api_router.include_router(history.router, prefix="/history", tags=["Activity History & Privacy"])
