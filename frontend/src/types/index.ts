export interface FileInfo {
  path: string;
  filename: string;
  extension: string;
  size_bytes: number;
  size_readable: string;
  modified_at: string;
  is_directory: boolean;
}

export interface ProposedFileAction {
  original_path: string;
  original_filename: string;
  suggested_category: 'Documents' | 'Code' | 'Images' | 'Academic' | 'Finance' | 'Miscellaneous' | string;
  suggested_filename: string;
  target_path: string;
  reason: string;
  confidence: number;
  is_conflict: boolean;
  resolved_target_path: string;
}

export interface ScanResponse {
  folder_path: string;
  total_files: number;
  total_bytes: number;
  total_readable: string;
  files: FileInfo[];
}

export interface OrganizeProposalResponse {
  folder_path: string;
  total_proposed: number;
  proposals: ProposedFileAction[];
  used_ai: boolean;
  model_name: string;
}

export interface ExecuteOrganizeResponse {
  task_id: string;
  dry_run: boolean;
  success_count: number;
  failed_count: number;
  results: any[];
  undo_available: boolean;
}

export interface BriefingDeadline {
  date: string;
  task: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface BriefingResponse {
  summary: string;
  key_points: string[];
  action_items: string[];
  deadlines: BriefingDeadline[];
  unresolved_questions: string[];
  what_needs_attention: string[];
  estimated_reading_minutes: number;
  used_ai: boolean;
  model_name: string;
}

export interface MicroStep {
  step_number: number;
  title: string;
  estimated_minutes: number;
  low_friction_tip: string;
  done?: boolean;
}

export interface TaskCrusherResponse {
  original_task: string;
  sloth_verdict: string;
  minimum_effort_strategy: string;
  micro_steps: MicroStep[];
  first_draft_preview?: string;
  used_ai: boolean;
  model_name: string;
}

export interface DocumentProcessResponse {
  action: string;
  original_length: number;
  processed_content: string;
  summary?: string;
  extracted_dates?: any[];
  checklist?: string[];
  used_ai: boolean;
  model_name: string;
}

export interface AutopilotTask {
  id: string;
  title: string;
  description: string;
  category: string;
  action_type: string;
  payload: any;
  status: 'suggested' | 'approved' | 'rejected' | 'completed';
  created_at: string;
}

export interface TaskHistoryItem {
  id: string;
  task_type: string;
  title: string;
  description?: string;
  status: string;
  estimated_seconds_saved: number;
  created_at: string;
  metadata?: any;
}

export interface StatsResponse {
  tasks_completed: number;
  estimated_minutes_saved: number;
  files_organized: number;
  pending_actions: number;
  active_model: string;
  ollama_online: boolean;
}

export interface ModelInfo {
  name: string;
  size: string;
  modified_at: string;
  details?: any;
}

export interface HealthResponse {
  status: string;
  app_version: string;
  ollama_online: boolean;
  active_model: string;
  available_models: ModelInfo[];
  latency_ms?: number;
  privacy_mode: string;
}
