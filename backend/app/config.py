import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = BASE_DIR.parent
DEFAULT_DATA_DIR = BASE_DIR / "data"
DEFAULT_DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    app_name: str = "SlothOS"
    version: str = "1.0.0"
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    default_model: str = os.getenv("DEFAULT_MODEL", "qwen2.5-coder:7b")
    db_path: str = str(DEFAULT_DATA_DIR / "slothos.db")
    allowed_roots: list[str] = [
        str(WORKSPACE_ROOT),
        str(Path.home() / "Downloads"),
        str(Path.home() / "Desktop"),
        str(Path.home() / "Documents"),
    ]
    request_timeout: float = 45.0

settings = Settings()
