import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.services.autopilot_service import autopilot_service

# Initialize test database tables and seed
init_db()
autopilot_service.seed_default_suggestions()

client = TestClient(app)

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "SlothOS" in data["message"]

def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "Local" in data["privacy_mode"]

def test_stats_endpoint():
    resp = client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "tasks_completed" in data
    assert "estimated_minutes_saved" in data

def test_autopilot_queue_endpoint():
    resp = client.get("/api/autopilot/queue")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["tasks"]) > 0

def test_crusher_endpoint():
    resp = client.post("/api/crusher/crush", json={
        "task_description": "Organize cluttered messy desk and papers",
        "procrastination_level": "moderate"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["micro_steps"]) > 0

def test_briefing_endpoint():
    resp = client.post("/api/briefing/generate", json={
        "text_content": "Project sync: Deliver release candidate by Friday. Carlos to review tests."
    })
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["key_points"]) <= 5

def test_activity_history_endpoint():
    resp = client.get("/api/history")
    assert resp.status_code == 200
    data = resp.json()
    assert "history" in data
