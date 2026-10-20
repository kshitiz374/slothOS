import os
import shutil
import tempfile
from pathlib import Path
import pytest
from app.database import init_db
from app.services.file_organizer import FileOrganizerService
from app.services.undo_manager import UndoManagerService
from app.models.schemas import ProposedFileAction

@pytest.fixture
def temp_sandbox():
    init_db()
    temp_dir = tempfile.mkdtemp(prefix="slothos_undo_test_")
    test_file = Path(temp_dir) / "notes_draft.txt"
    test_file.write_text("Important research notes")
    yield Path(temp_dir), test_file
    shutil.rmtree(temp_dir, ignore_errors=True)

def test_execute_and_undo_cycle(temp_sandbox):
    sandbox_dir, orig_file = temp_sandbox
    target_file = sandbox_dir / "Documents" / "Notes_Clean.txt"

    proposal = ProposedFileAction(
        original_path=str(orig_file),
        original_filename=orig_file.name,
        suggested_category="Documents",
        suggested_filename="Notes_Clean.txt",
        target_path=str(target_file),
        reason="Document text file",
        confidence=0.95,
        is_conflict=False,
        resolved_target_path=str(target_file)
    )

    # 1. Execute Move
    exec_result = FileOrganizerService.execute_organization(str(sandbox_dir), [proposal], dry_run=False)
    assert exec_result["success_count"] == 1
    assert not orig_file.exists()
    assert target_file.exists()

    task_id = exec_result["task_id"]

    # 2. Undo Move
    undo_result = UndoManagerService.revert_task(task_id)
    assert undo_result["success"] is True
    assert undo_result["reverted_count"] == 1

    # 3. Verify file restored to original location
    assert orig_file.exists()
    assert orig_file.read_text() == "Important research notes"
    assert not target_file.exists()

    # 4. Verify empty category directory was cleaned
    assert not (sandbox_dir / "Documents").exists()
