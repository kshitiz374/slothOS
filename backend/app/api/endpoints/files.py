from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ScanFolderRequest, ScanFolderResponse,
    OrganizeProposalRequest, OrganizeProposalResponse,
    ExecuteOrganizeRequest, ExecuteOrganizeResponse,
    UndoRequest, UndoResponse
)
from app.services.file_organizer import file_organizer
from app.services.undo_manager import undo_manager

router = APIRouter()

@router.post("/scan", response_model=ScanFolderResponse)
def scan_directory(req: ScanFolderRequest):
    try:
        return file_organizer.scan_folder(req.folder_path, recursive=req.recursive)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error scanning directory: {str(e)}")

@router.post("/propose", response_model=OrganizeProposalResponse)
async def propose_organize(req: OrganizeProposalRequest):
    try:
        result = await file_organizer.propose_organization(req.folder_path, req.file_paths)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating proposal: {str(e)}")

@router.post("/execute", response_model=ExecuteOrganizeResponse)
def execute_organize(req: ExecuteOrganizeRequest):
    try:
        return file_organizer.execute_organization(req.folder_path, req.proposals, dry_run=req.dry_run)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing file operations: {str(e)}")

@router.post("/undo", response_model=UndoResponse)
def undo_organize(req: UndoRequest):
    try:
        return undo_manager.revert_task(req.task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reverting operations: {str(e)}")
