from fastapi import APIRouter, HTTPException
from app.models.schemas import AutopilotQueueResponse, AutopilotActionRequest, AutopilotExecuteResponse
from app.services.autopilot_service import autopilot_service

router = APIRouter()

@router.get("/queue", response_model=AutopilotQueueResponse)
def get_queue():
    try:
        return autopilot_service.get_queue()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching autopilot queue: {str(e)}")

@router.post("/action", response_model=AutopilotExecuteResponse)
async def handle_task_action(req: AutopilotActionRequest):
    try:
        res = await autopilot_service.update_task(req.task_id, req.action)
        return AutopilotExecuteResponse(
            task_id=res["task_id"],
            status=res["status"],
            message=res["message"],
            result=res.get("result")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing autopilot action: {str(e)}")
