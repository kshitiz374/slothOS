import uuid
import json
import logging
from typing import Dict, Any, Optional
from app.database import get_db
from app.services.ollama_client import ollama_client
from app.services.fallback_engine import fallback_engine

logger = logging.getLogger(__name__)

class TaskCrusherService:
    @classmethod
    async def crush(cls, task_description: str, level: str = "moderate") -> Dict[str, Any]:
        if not task_description or not task_description.strip():
            raise ValueError("Task description cannot be empty")

        health = await ollama_client.check_health()
        result_data = None
        used_ai = False
        model_name = "Deterministic Rule-based Fallback"

        if health["online"]:
            prompt = f"""
You are the SlothOS Procrastination Crusher. Your philosophy:
"Laziness is just friction. Lower the friction to zero, remove all guilt, and break tasks into tiny 2-to-10-minute micro-actions."

The user has been putting off this task:
"{task_description.strip()}"
Procrastination level: {level}

Generate a calm, zero-pressure JSON response with:
1. "sloth_verdict": A warm, humorous, empathetic 1-2 sentence reassuring observation (NO guilt, NO toxic hustle culture, NO streaks).
2. "minimum_effort_strategy": A 1-sentence lazy strategy (e.g. 'The 5-minute permission to quit technique').
3. "micro_steps": An array of 3 to 4 micro-steps. Each object MUST have:
   - "step_number": integer
   - "title": Actionable micro-step taking 2 to 8 minutes
   - "estimated_minutes": integer between 2 and 10
   - "low_friction_tip": A relaxing, low-effort tip
4. "first_draft_preview": A ready-to-use initial draft, outline, or markdown template that gives them a 50% head start.

Output STRICT JSON only.
"""
            system = "You are a playful, cozy, anti-guilt sloth productivity assistant. Output pure JSON."
            try:
                ai_res = await ollama_client.generate_json(prompt, system_prompt=system, timeout=30.0)
                if ai_res and isinstance(ai_res, dict) and "micro_steps" in ai_res:
                    result_data = {
                        "original_task": task_description,
                        "sloth_verdict": ai_res.get("sloth_verdict", "No worries. We'll start with the bare minimum."),
                        "minimum_effort_strategy": ai_res.get("minimum_effort_strategy", "Low-friction step-by-step"),
                        "micro_steps": ai_res.get("micro_steps", []),
                        "first_draft_preview": ai_res.get("first_draft_preview", ""),
                        "used_ai": True,
                        "model_name": health.get("active_model", "qwen2.5-coder:7b")
                    }
                    used_ai = True
                    model_name = result_data["model_name"]
            except Exception as e:
                logger.warning(f"Ollama task crushing failed: {e}")

        if not result_data:
            result_data = fallback_engine.crush_task(task_description, level)

        # Log into history
        task_id = str(uuid.uuid4())
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO task_history (id, task_type, title, description, status, estimated_seconds_saved, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                task_id,
                "task_crush",
                f"Crushed task: {task_description[:50]}",
                result_data.get("minimum_effort_strategy", "Generated micro-plan"),
                "completed",
                1200, # saved 20 minutes of anxiety
                json.dumps({"level": level})
            ))
            conn.commit()

        return result_data

    @classmethod
    async def generate_starter(cls, task_description: str, step_title: str) -> Dict[str, Any]:
        health = await ollama_client.check_health()
        
        if health["online"]:
            prompt = f"""
The user is working on: "{task_description}"
They are ready for this specific micro-step: "{step_title}"

Generate a complete, high-quality, ready-to-paste starter asset (markdown document, email draft, code skeleton, or outline).
Make it practical, complete, and low-friction so they don't have to face a blank page.
"""
            system = "You are SlothOS Starter Generator. Output markdown directly without chat chatter."
            res = await ollama_client.generate_text(prompt, system_prompt=system, timeout=25.0)
            if res:
                return {
                    "starter_content": res,
                    "asset_type": "generated_starter"
                }

        # Fallback starter
        starter = f"# Starter Asset: {step_title}\n\n*Context: {task_description}*\n\n## Quick Start Template\n- [ ] 1. Fill in subject / title\n- [ ] 2. Core idea in 1 line: \n- [ ] 3. Key details:\n\n---\n*Created by SlothOS — You did the hard part just by starting!*"
        return {
            "starter_content": starter,
            "asset_type": "template"
        }

task_crusher = TaskCrusherService()
