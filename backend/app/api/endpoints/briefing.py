from fastapi import APIRouter, HTTPException
from app.models.schemas import BriefingRequest, BriefingResponse
from app.services.briefing_service import briefing_service

router = APIRouter()

@router.post("/generate", response_model=BriefingResponse)
async def generate_briefing(req: BriefingRequest):
    try:
        return await briefing_service.generate_briefing(
            text_content=req.text_content,
            file_paths=req.file_paths
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating briefing: {str(e)}")
