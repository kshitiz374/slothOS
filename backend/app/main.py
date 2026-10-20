import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api.router import api_router
from app.services.autopilot_service import autopilot_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and autopilot queue
    init_db()
    autopilot_service.seed_default_suggestions()
    yield
    # Shutdown

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="SlothOS: The AI That Works While You Don't — A local-first, privacy-respecting automation assistant.",
    lifespan=lifespan
)

# CORS Middleware for Local Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to SlothOS — The AI That Works While You Don't",
        "philosophy": "Do less. Let your sloth handle the rest.",
        "version": settings.version,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
