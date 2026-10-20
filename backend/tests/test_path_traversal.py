import pytest
from pathlib import Path
from app.services.file_organizer import FileOrganizerService

def test_empty_path_raises_error():
    with pytest.raises(ValueError, match="Folder path cannot be empty"):
        FileOrganizerService.validate_path_sandbox("")

def test_nonexistent_path_raises_error():
    with pytest.raises(ValueError, match="Path does not exist"):
        FileOrganizerService.validate_path_sandbox("C:/nonexistent_folder_xyz_12345")

def test_drive_root_blocked():
    with pytest.raises(ValueError, match="Direct access to drive root is restricted"):
        FileOrganizerService.validate_path_sandbox("C:/")

def test_valid_directory_passes():
    workspace = Path(__file__).resolve().parent.parent.parent
    validated = FileOrganizerService.validate_path_sandbox(str(workspace))
    assert validated.exists()
    assert validated.is_dir()
