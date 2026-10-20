import os
import uuid
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from app.database import get_db
from app.services.ollama_client import ollama_client
from app.services.fallback_engine import fallback_engine
from app.services.briefing_service import BriefingService

logger = logging.getLogger(__name__)

class DocumentAssistantService:
    @classmethod
    async def process_document(cls, text: Optional[str] = None, file_path: Optional[str] = None, action: str = "summarize") -> Dict[str, Any]:
        raw_text = text or ""
        if file_path:
            try:
                file_text = BriefingService.extract_text_from_file(file_path)
                raw_text = (raw_text + "\n" + file_text).strip()
            except Exception as e:
                raise ValueError(f"Could not read source file: {e}")

        if not raw_text.strip():
            raise ValueError("No text or readable document provided.")

        truncated = raw_text[:16000]
        health = await ollama_client.check_health()
        result_data = None
        used_ai = False
        model_name = "Deterministic Rule-based Fallback"

        if health["online"]:
            system = "You are SlothOS Document Assistant. Provide crisp, high-utility Markdown transformations."
            if action == "summarize":
                prompt = f"""
Summarize the following document for a busy user who wants only what matters.
Include:
1. Executive Summary (2-3 sentences)
2. Critical Findings / Takeaways (bullet points)
3. Action Items or Deadlines mentioned

Document text:
```{truncated}```
"""
            elif action == "extract_dates":
                prompt = f"""
Extract all deadlines, milestones, scheduled dates, and names mentioned in the following text.
Format as a clean markdown table with columns: | Date/Time | Event / Deadline | Owner/Name | Priority |

Document text:
```{truncated}```
"""
            elif action == "convert_checklist":
                prompt = f"""
Extract and convert all actionable tasks, recommendations, and next steps from this document into a structured GitHub-style Markdown checklist (- [ ] task).
Group them logically by priority or category.

Document text:
```{truncated}```
"""
            else: # clean_markdown
                prompt = f"""
Convert these raw unstructured notes into clean, beautifully formatted Markdown with headers, bullet points, callout blocks, and bold emphasis.

Notes:
```{truncated}```
"""
            try:
                ai_text = await ollama_client.generate_text(prompt, system_prompt=system, timeout=30.0)
                if ai_text:
                    result_data = {
                        "action": action,
                        "original_length": len(raw_text),
                        "processed_content": ai_text,
                        "summary": ai_text[:300] + "..." if len(ai_text) > 300 else ai_text,
                        "used_ai": True,
                        "model_name": health.get("active_model", "qwen2.5-coder:7b")
                    }
                    used_ai = True
                    model_name = result_data["model_name"]
            except Exception as e:
                logger.warning(f"Ollama document processing failed: {e}")

        if not result_data:
            result_data = fallback_engine.process_document(truncated, action)

        # Log task in DB
        task_id = str(uuid.uuid4())
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO task_history (id, task_type, title, description, status, estimated_seconds_saved, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                task_id,
                "doc_summary",
                f"Document Assistant: {action.replace('_', ' ').title()}",
                f"Processed {len(raw_text)} chars of text",
                "completed",
                600,
                json.dumps({"action": action})
            ))
            conn.commit()

        return result_data

document_assistant = DocumentAssistantService()
