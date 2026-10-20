from fastapi import APIRouter, HTTPException
from app.models.schemas import DocumentProcessRequest, DocumentProcessResponse
from app.services.document_assistant import document_assistant

router = APIRouter()

@router.post("/process", response_model=DocumentProcessResponse)
async def process_document(req: DocumentProcessRequest):
    try:
        return await document_assistant.process_document(
            text=req.text,
            file_path=req.file_path,
            action=req.action
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
