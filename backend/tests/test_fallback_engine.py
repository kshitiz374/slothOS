from app.services.fallback_engine import FallbackEngine

def test_fallback_file_classification():
    # Finance
    fin = FallbackEngine.classify_file("invoice_oct_2026.pdf")
    assert fin["category"] == "Finance"

    # Code
    code = FallbackEngine.classify_file("data_processor.py")
    assert code["category"] == "Code"

    # Images
    img = FallbackEngine.classify_file("screenshot_123.png")
    assert img["category"] == "Images"

    # Academic
    acad = FallbackEngine.classify_file("thesis_draft_final.docx")
    assert acad["category"] == "Academic"

def test_fallback_briefing_generation():
    sample_text = """
    Team Meeting:
    - [ ] Carlos to fix performance regression by Thursday.
    - Urgent: Freeze deadline is Oct 28 at 5 PM!
    - Unresolved question: Should we add dark mode?
    """
    res = FallbackEngine.generate_briefing(sample_text)
    assert len(res["key_points"]) <= 5
    assert len(res["action_items"]) > 0
    assert len(res["deadlines"]) > 0
    assert res["used_ai"] is False

def test_fallback_task_crusher():
    task = "Write literature review for machine learning paper"
    res = FallbackEngine.crush_task(task)
    assert len(res["micro_steps"]) >= 3
    for s in res["micro_steps"]:
        assert 2 <= s["estimated_minutes"] <= 10
    assert "preview" in res["first_draft_preview"].lower() or "literature" in res["first_draft_preview"].lower()
