from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# File Management Schemas
class FileInfo(BaseModel):
    path: str
    filename: str
    extension: str
    size_bytes: int
    size_readable: str
    modified_at: str
    is_directory: bool = False

class ScanFolderRequest(BaseModel):
    folder_path: str
    recursive: bool = False

class ScanFolderResponse(BaseModel):
    folder_path: str
    total_files: int
    total_bytes: int
    total_readable: str
    files: List[FileInfo]

class ProposedFileAction(BaseModel):
    original_path: str
    original_filename: str
    suggested_category: str
    suggested_filename: str
    target_path: str
    reason: str
    confidence: float = 0.95
    is_conflict: bool = False
    resolved_target_path: str

class OrganizeProposalRequest(BaseModel):
    folder_path: str
    file_paths: Optional[List[str]] = None

class OrganizeProposalResponse(BaseModel):
    folder_path: str
    total_proposed: int
    proposals: List[ProposedFileAction]
    used_ai: bool
    model_name: str

class ExecuteOrganizeRequest(BaseModel):
    folder_path: str
    proposals: List[ProposedFileAction]
    dry_run: bool = False

class ExecuteOrganizeResponse(BaseModel):
    task_id: str
    dry_run: bool
    success_count: int
    failed_count: int
    results: List[Dict[str, Any]]
    undo_available: bool

class UndoRequest(BaseModel):
    task_id: Optional[str] = None

class UndoResponse(BaseModel):
    success: bool
    reverted_count: int
    errors: List[str] = []

# Morning Briefing Schemas
class BriefingRequest(BaseModel):
    text_content: Optional[str] = None
    file_paths: Optional[List[str]] = None

class BriefingDeadline(BaseModel):
    date: str
    task: str
    urgency: str = "medium"

class BriefingResponse(BaseModel):
    summary: str
    key_points: List[str] = Field(..., max_items=5)
    action_items: List[str]
    deadlines: List[BriefingDeadline]
    unresolved_questions: List[str]
    what_needs_attention: List[str]
    estimated_reading_minutes: int
    used_ai: bool
    model_name: str

# Procrastination Crusher Schemas
class MicroStep(BaseModel):
    step_number: int
    title: str
    estimated_minutes: int
    low_friction_tip: str
    done: bool = False

class TaskCrusherRequest(BaseModel):
    task_description: str
    procrastination_level: str = "moderate"

class TaskCrusherResponse(BaseModel):
    original_task: str
    sloth_verdict: str
    minimum_effort_strategy: str
    micro_steps: List[MicroStep]
    first_draft_preview: Optional[str] = None
    used_ai: bool
    model_name: str

class StarterDraftRequest(BaseModel):
    task_description: str
    step_title: str

class StarterDraftResponse(BaseModel):
    starter_content: str
    asset_type: str

# Document Assistant Schemas
class DocumentProcessRequest(BaseModel):
    text: Optional[str] = None
    file_path: Optional[str] = None
    action: str = "summarize" # 'summarize', 'extract_dates', 'convert_checklist', 'clean_markdown'

class DocumentProcessResponse(BaseModel):
    action: str
    original_length: int
    processed_content: str
    summary: Optional[str] = None
    extracted_dates: List[Dict[str, Any]] = []
    checklist: List[str] = []
    used_ai: bool
    model_name: str

# Autopilot Schemas
class AutopilotTask(BaseModel):
    id: str
    title: str
    description: str
    category: str
    action_type: str
    payload: Dict[str, Any]
    status: str
    created_at: str

class AutopilotQueueResponse(BaseModel):
    tasks: List[AutopilotTask]
    pending_count: int

class AutopilotActionRequest(BaseModel):
    task_id: str
    action: str # 'approve', 'reject', 'execute'

class AutopilotExecuteResponse(BaseModel):
    task_id: str
    status: str
    message: str
    result: Optional[Dict[str, Any]] = None

# History and System Stats
class TaskHistoryItem(BaseModel):
    id: str
    task_type: str
    title: str
    description: Optional[str] = None
    status: str
    estimated_seconds_saved: int
    created_at: str
    metadata: Optional[Dict[str, Any]] = None

class ActivityHistoryResponse(BaseModel):
    history: List[TaskHistoryItem]

class StatsResponse(BaseModel):
    tasks_completed: int
    estimated_minutes_saved: int
    files_organized: int
    pending_actions: int
    active_model: str
    ollama_online: bool

# Health and Model Management
class ModelInfo(BaseModel):
    name: str
    size: str
    modified_at: str
    details: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    app_version: str
    ollama_online: bool
    active_model: str
    available_models: List[ModelInfo]
    latency_ms: Optional[float] = None
    privacy_mode: str = "100% Local Inference (Zero Cloud Leaks)"

class SwitchModelRequest(BaseModel):
    model_name: str
