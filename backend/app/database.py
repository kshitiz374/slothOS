import sqlite3
import json
from contextlib import contextmanager
from typing import Generator, Any
from app.config import settings

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Task History Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS task_history (
                id TEXT PRIMARY KEY,
                task_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL,
                estimated_seconds_saved INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata_json TEXT
            )
        """)
        
        # Undo Manifests Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS undo_manifests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                original_path TEXT NOT NULL,
                new_path TEXT NOT NULL,
                category TEXT,
                operation_type TEXT NOT NULL, -- 'move' or 'rename'
                reverted INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES task_history(id)
            )
        """)
        
        # Autopilot Queue Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS autopilot_queue (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                action_type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'suggested', -- 'suggested', 'approved', 'rejected', 'completed'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Settings Key-Value Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings_store (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)
        
        conn.commit()

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
