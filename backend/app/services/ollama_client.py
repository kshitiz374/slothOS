import time
import json
import logging
from typing import Optional, Dict, Any, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: Optional[str] = None, default_model: Optional[str] = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.active_model = default_model or settings.default_model

    async def check_health(self) -> Dict[str, Any]:
        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                latency = round((time.perf_counter() - start) * 1000, 2)
                if res.status_code == 200:
                    data = res.json()
                    models = data.get("models", [])
                    return {
                        "online": True,
                        "latency_ms": latency,
                        "models": models,
                        "active_model": self.active_model
                    }
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
        return {
            "online": False,
            "latency_ms": None,
            "models": [],
            "active_model": self.active_model
        }

    async def list_models(self) -> List[Dict[str, Any]]:
        health = await self.check_health()
        if not health["online"]:
            return []
        
        parsed_models = []
        for m in health.get("models", []):
            name = m.get("name", "unknown")
            size_bytes = m.get("size", 0)
            size_gb = f"{size_bytes / (1024**3):.1f} GB" if size_bytes > 0 else "Unknown"
            parsed_models.append({
                "name": name,
                "size": size_gb,
                "modified_at": m.get("modified_at", ""),
                "details": m.get("details", {})
            })
        return parsed_models

    def set_active_model(self, model_name: str):
        self.active_model = model_name

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None, timeout: float = 35.0) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.active_model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2,
                "top_p": 0.9,
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    raw_text = resp.json().get("response", "{}")
                    return json.loads(raw_text)
                else:
                    logger.error(f"Ollama returned HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Error querying Ollama generate_json: {e}")
        return None

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, timeout: float = 35.0) -> Optional[str]:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.active_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.5,
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    return resp.json().get("response", "").strip()
        except Exception as e:
            logger.error(f"Error querying Ollama generate_text: {e}")
        return None

ollama_client = OllamaClient()
