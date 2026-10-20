import os
import shutil
import tempfile
from pathlib import Path
import pytest
from app.services.file_organizer import FileOrganizerService
from app.models.schemas import ProposedFileAction

@pytest.fixture
def temp_sandbox():
    temp_dir = tempfile.mkdtemp(prefix="slothos_test_")
    # Populate with sample files
    (Path(temp_dir) / "messy_invoice.pdf").write_text("Invoice test content")
    (Path(temp_dir) / "test_script.py").write_text("print('hello world')")
    (Path(temp_dir) / "vacation_photo.jpg").write_bytes(b"\xff\xd8\xff\xe0")
    yield Path(temp_dir)
    shutil.rmtree(temp_dir, ignore_errors=True)

def test_scan_folder(temp_sandbox):
    scan = FileOrganizerService.scan_folder(str(temp_sandbox))
    assert scan.total_files == 3
    filenames = {f.filename for f in scan.files}
    assert "messy_invoice.pdf" in filenames
    assert "test_script.py" in filenames
    assert "vacation_photo.jpg" in filenames

def test_collision_resolution(temp_sandbox):
    # Create an existing file in target
    target_dir = temp_sandbox / "Documents"
    target_dir.mkdir(parents=True, exist_ok=True)
    existing_file = target_dir / "report.pdf"
    existing_file.write_text("Original report")

    # Resolve collision for same name
    resolved = FileOrganizerService.resolve_collision(target_dir, "report.pdf")
    assert resolved.name == "report_1.pdf"

    # Create report_1.pdf and check report_2.pdf
    (target_dir / "report_1.pdf").write_text("Second report")
    resolved_second = FileOrganizerService.resolve_collision(target_dir, "report.pdf")
    assert resolved_second.name == "report_2.pdf"

def test_dry_run_does_not_modify_disk(temp_sandbox):
    orig_file = temp_sandbox / "messy_invoice.pdf"
    target_file = temp_sandbox / "Finance" / "Clean_Invoice.pdf"
    
    proposal = ProposedFileAction(
        original_path=str(orig_file),
        original_filename=orig_file.name,
        suggested_category="Finance",
        suggested_filename="Clean_Invoice.pdf",
        target_path=str(target_file),
        reason="Detected billing",
        confidence=0.9,
        is_conflict=False,
        resolved_target_path=str(target_file)
    )

    result = FileOrganizerService.execute_organization(str(temp_sandbox), [proposal], dry_run=True)
    assert result["dry_run"] is True
    assert orig_file.exists()
    assert not target_file.exists()
