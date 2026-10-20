import re
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

class FallbackEngine:
    @staticmethod
    def classify_file(filename: str) -> Dict[str, Any]:
        """Deterministic heuristic classifier for files."""
        name_lower = filename.lower()
        _, ext = os.path.splitext(name_lower)
        
        # 1. Finance heuristics
        finance_keywords = ["invoice", "receipt", "tax", "expense", "reimburse", "statement", "billing", "bill", "salary", "payroll", "budget"]
        if any(k in name_lower for k in finance_keywords) or (ext in [".csv", ".xlsx", ".xls"] and any(k in name_lower for k in ["exp", "pay", "fin", "cost"])):
            clean_name = FallbackEngine._clean_filename(filename, "Finance")
            return {
                "category": "Finance",
                "suggested_filename": clean_name,
                "reason": "Detected financial keywords or billing pattern",
                "confidence": 0.88
            }
            
        # 2. Academic heuristics
        academic_keywords = ["thesis", "syllabus", "lecture", "assignment", "homework", "paper", "research", "exam", "lab", "study", "slides"]
        if any(k in name_lower for k in academic_keywords):
            clean_name = FallbackEngine._clean_filename(filename, "Academic")
            return {
                "category": "Academic",
                "suggested_filename": clean_name,
                "reason": "Detected academic / coursework context",
                "confidence": 0.85
            }
            
        # 3. Code & Dev heuristics
        code_exts = {".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".json", ".yaml", ".yml", ".cpp", ".c", ".rs", ".go", ".sh", ".sql", ".env"}
        if ext in code_exts or "script" in name_lower or "scraper" in name_lower or "api" in name_lower:
            clean_name = FallbackEngine._clean_filename(filename, "Code")
            return {
                "category": "Code",
                "suggested_filename": clean_name,
                "reason": "Recognized programming source code or developer script",
                "confidence": 0.95
            }

        # 4. Images heuristics
        image_exts = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".bmp", ".tiff", ".ico"}
        if ext in image_exts:
            prefix = "Screenshot" if "screenshot" in name_lower else "Image"
            clean_name = FallbackEngine._clean_filename(filename, prefix)
            return {
                "category": "Images",
                "suggested_filename": clean_name,
                "reason": "Image asset detected",
                "confidence": 0.92
            }

        # 5. Documents heuristics
        doc_exts = {".pdf", ".docx", ".doc", ".txt", ".rtf", ".odt", ".pages", ".md"}
        if ext in doc_exts:
            clean_name = FallbackEngine._clean_filename(filename, "Doc")
            return {
                "category": "Documents",
                "suggested_filename": clean_name,
                "reason": "Standard document or text format",
                "confidence": 0.85
            }

        # 6. Fallback / Miscellaneous
        return {
            "category": "Miscellaneous",
            "suggested_filename": filename,
            "reason": "Categorized as general miscellaneous file",
            "confidence": 0.70
        }

    @staticmethod
    def _clean_filename(original_name: str, category_tag: str) -> str:
        base, ext = os.path.splitext(original_name)
        # Normalize messy separators
        cleaned = re.sub(r"[_\-\.]+", " ", base)
        # Remove noisy words like 'final_v2_final_NEW'
        cleaned = re.sub(r"\b(final|draft|copy|new|v\d+|temp)\b", "", cleaned, flags=re.IGNORECASE)
        # Handle camera names like DSC 0912
        cleaned = re.sub(r"\b(dsc|img|screenshot)\s*\d*\b", "", cleaned, flags=re.IGNORECASE).strip()
        
        words = [w.capitalize() for w in cleaned.split() if w]
        if not words:
            words = [category_tag]
            
        formatted_name = "_".join(words) + ext
        return formatted_name

    @staticmethod
    def generate_briefing(text: str) -> Dict[str, Any]:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        deadlines = []
        action_items = []
        questions = []
        key_points = []

        date_patterns = [
            r"(due\s+(?:on|by)?\s*([A-Za-z0-9\s,]+))",
            r"(deadline\s*(?:is)?\s*([A-Za-z0-9\s,]+))",
            r"(by\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|tomorrow|tonight|[A-Za-z]+\s+\d+))",
            r"(urgent.*)",
        ]

        for line in lines:
            line_lower = line.lower()
            # Check for deadlines
            for dp in date_patterns:
                match = re.search(dp, line, re.IGNORECASE)
                if match:
                    deadlines.append({
                        "date": match.group(0)[:40],
                        "task": line[:80],
                        "urgency": "high" if "urgent" in line_lower or "today" in line_lower else "medium"
                    })
                    break

            # Check for action items
            if line.startswith(("- [ ]", "* [ ]", "TODO", "todo", "Action:", "Next step:")) or any(w in line_lower for w in ["need to", "must complete", "don't forget"]):
                action_items.append(line.lstrip("-*[] ").strip())

            # Check for questions
            if line.endswith("?") or "wondering" in line_lower or "to clarify" in line_lower:
                questions.append(line)

            # Potential key points
            if len(key_points) < 5 and len(line) > 25 and not line.startswith(("#", "//", "/*")):
                key_points.append(line)

        # Fallbacks if text was brief or non-standard
        if not key_points:
            key_points = [line for line in lines[:5]] if lines else ["No significant items found in source."]
        if not action_items:
            action_items = ["Review imported notes for general context", "Confirm upcoming commitments"]
        if not deadlines:
            deadlines = [{"date": "Upcoming", "task": "Regular check-in on project status", "urgency": "low"}]
        if not questions:
            questions = ["Are all project deliverables on track for the current milestone?"]

        summary = f"Synthesized from {len(lines)} lines of imported logs and documents. Highlights key deliverables and priority tasks."

        what_needs_attention = [item["task"] for item in deadlines if item["urgency"] == "high"]
        if not what_needs_attention:
            what_needs_attention = action_items[:2]

        return {
            "summary": summary,
            "key_points": key_points[:5],
            "action_items": action_items[:6],
            "deadlines": deadlines[:5],
            "unresolved_questions": questions[:4],
            "what_needs_attention": what_needs_attention[:3],
            "estimated_reading_minutes": max(1, len(text.split()) // 200),
            "used_ai": False,
            "model_name": "Deterministic Fallback Engine (Rule-based)"
        }

    @staticmethod
    def crush_task(task_description: str, level: str = "moderate") -> Dict[str, Any]:
        desc_lower = task_description.lower()
        
        # Determine archetype
        if any(w in desc_lower for w in ["write", "essay", "blog", "paper", "doc", "article", "report"]):
            steps = [
                {"step_number": 1, "title": "Create a blank document with the title and 3 bullet points", "estimated_minutes": 2, "low_friction_tip": "Don't write prose yet. Just type 3 random thoughts as bullets."},
                {"step_number": 2, "title": "Write a messy, imperfect introductory sentence", "estimated_minutes": 4, "low_friction_tip": "Pretend you are explaining it to a friendly sloth. Grammar doesn't matter."},
                {"step_number": 3, "title": "Paste in reference links or background bullet points", "estimated_minutes": 5, "low_friction_tip": "Collect existing material rather than inventing new words from scratch."},
                {"step_number": 4, "title": "Take a 5-minute stretch or tea break (Mandatory)", "estimated_minutes": 5, "low_friction_tip": "You just made the hardest jump from 0 to 1. Relax."}
            ]
            strategy = "The 'Three Bullets and a Cup of Tea' Strategy — Eliminate blank page terror by starting with fragments."
            preview = f"# {task_description.title()}\n\n## Core Objectives\n- [ ] Main thesis/point:\n- [ ] Target audience takeaway:\n- [ ] Key evidence or finding:\n\n## Working Draft\nThis draft outlines the initial scope without overthinking the structure..."
        elif any(w in desc_lower for w in ["code", "bug", "feature", "refactor", "app", "api", "test"]):
            steps = [
                {"step_number": 1, "title": "Reproduce the behavior or write a 5-line failing test", "estimated_minutes": 3, "low_friction_tip": "Isolate the smallest possible snippet before touching core logic."},
                {"step_number": 2, "title": "Add a print/log statement to verify assumptions", "estimated_minutes": 2, "low_friction_tip": "Check the exact payload entering the function."},
                {"step_number": 3, "title": "Implement the simplest naive fix (ignore perfection)", "estimated_minutes": 7, "low_friction_tip": "Make it work first, optimize later if ever needed."},
                {"step_number": 4, "title": "Commit the micro-progress with a clear message", "estimated_minutes": 2, "low_friction_tip": "Lock in your momentum so you can step away without guilt."}
            ]
            strategy = "The 'Lowest Viable Diff' Approach — Shrink the problem until it fits in a single function."
            preview = f"# Micro-Implementation Plan: {task_description}\n\n```python\n# Step 1: Input validation\ndef test_minimal_scenario():\n    assert True # Replace with your single isolated condition\n```"
        elif any(w in desc_lower for w in ["tax", "invoice", "finance", "bill", "expense"]):
            steps = [
                {"step_number": 1, "title": "Create a single folder called 'Taxes_Raw_Receipts'", "estimated_minutes": 2, "low_friction_tip": "No sorting yet. Just gather whatever PDFs or receipts you have."},
                {"step_number": 2, "title": "Find the last 3 bank or credit statements", "estimated_minutes": 4, "low_friction_tip": "Download them into the folder. Don't open the calculator yet."},
                {"step_number": 3, "title": "Log 3 main totals into a simple 2-column checklist", "estimated_minutes": 5, "low_friction_tip": "Just income, expenses, and dates."},
                {"step_number": 4, "title": "Stop for the day or celebrate with a snack", "estimated_minutes": 3, "low_friction_tip": "Paperwork is emotionally draining. Celebrate small bites."}
            ]
            strategy = "The 'Gathering Pile' Strategy — Separate collecting documents from actually filing them."
            preview = f"### Financial Task: {task_description}\n\n- [ ] Checklist: Download statement 1\n- [ ] Checklist: Download statement 2\n- [ ] Quick calculation notes:\n  - Category: Business Expenses\n  - Estimated total: Pending verification"
        else:
            steps = [
                {"step_number": 1, "title": "Define the absolute minimum acceptable finish line", "estimated_minutes": 2, "low_friction_tip": "What is the 'good enough' version that lets you sleep at night?"},
                {"step_number": 2, "title": "Set a timer for 5 minutes and work with zero tabs open", "estimated_minutes": 5, "low_friction_tip": "When the timer rings, you have full permission to quit."},
                {"step_number": 3, "title": "Write down the exact next 1 physical movement", "estimated_minutes": 3, "low_friction_tip": "E.g., 'Open file X and press Ctrl+F' — physical clarity destroys inertia."}
            ]
            strategy = "The 'Permission to Stop' Technique — Lower the barrier until resistance vanishes."
            preview = f"## Minimum Effort Action Card: {task_description}\n\n- [ ] Step 1: Physical setup (30 seconds)\n- [ ] Step 2: Draft starting point (5 minutes)\n- [ ] Step 3: Review and rest"

        return {
            "original_task": task_description,
            "sloth_verdict": "Take a breath. This task looked intimidating because you were imagining doing the whole thing at once.",
            "minimum_effort_strategy": strategy,
            "micro_steps": steps,
            "first_draft_preview": preview,
            "used_ai": False,
            "model_name": "Deterministic Fallback Engine (Rule-based)"
        }

    @staticmethod
    def process_document(text: str, action: str) -> Dict[str, Any]:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        if action == "convert_checklist":
            items = []
            for line in lines:
                cleaned = re.sub(r"^[\*\-\d\.\s\(\)]+", "", line).strip()
                if cleaned and len(cleaned) > 5:
                    items.append(f"- [ ] {cleaned}")
            content = "## Actionable Checklist\n\n" + "\n".join(items[:15])
            return {
                "action": action,
                "original_length": len(text),
                "processed_content": content,
                "checklist": items[:15],
                "used_ai": False,
                "model_name": "Deterministic Fallback Engine"
            }
        elif action == "clean_markdown":
            formatted = ["# Structured Notes\n"]
            for line in lines:
                if len(line) < 40 and not line.endswith("."):
                    formatted.append(f"\n### {line}\n")
                else:
                    formatted.append(f"- {line}")
            content = "\n".join(formatted)
            return {
                "action": action,
                "original_length": len(text),
                "processed_content": content,
                "used_ai": False,
                "model_name": "Deterministic Fallback Engine"
            }
        else: # summarize
            # Salience-based extraction: take top lines with dates or key verbs
            salient = [l for l in lines if any(w in l.lower() for w in ["important", "key", "summary", "goal", "deadline", "result", "must"])][:4]
            if not salient and lines:
                salient = lines[:3]
            summary_text = " • " + "\n • ".join(salient) if salient else "Summary of imported document."
            return {
                "action": action,
                "original_length": len(text),
                "processed_content": f"## Document Summary\n\n{summary_text}",
                "summary": summary_text,
                "used_ai": False,
                "model_name": "Deterministic Fallback Engine"
            }

fallback_engine = FallbackEngine()
