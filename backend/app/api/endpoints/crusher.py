from fastapi import APIRouter, HTTPException
from app.models.schemas import TaskCrusherRequest, TaskCrusherResponse, StarterDraftRequest, StarterDraftResponse
from app.services.task_crusher import task_crusher

router = APIRouter()

@router.post("/crush", response_model=TaskCrusherResponse)
async def crush_procrastination(req: TaskCrusherRequest):
    try:
        return await task_crusher.crush(req.task_description, req.procrastination_level)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error crushing task: {str(e)}")

@router.post("/starter", response_model=StarterDraftResponse)
async def generate_starter_draft(req: StarterDraftRequest):
    try:
        return await task_crusher.generate_starter(req.task_description, req.step_title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating starter asset: {str(e)}")
