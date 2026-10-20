import {
  HealthResponse,
  StatsResponse,
  ScanResponse,
  OrganizeProposalResponse,
  ExecuteOrganizeResponse,
  BriefingResponse,
  TaskCrusherResponse,
  DocumentProcessResponse,
  AutopilotTask,
  TaskHistoryItem
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Health & Models
  getHealth: () => request<HealthResponse>('/health'),
  getStats: () => request<StatsResponse>('/stats'),
  switchModel: (model_name: string) =>
    request<{ success: boolean; active_model: string }>('/models/switch', {
      method: 'POST',
      body: JSON.stringify({ model_name })
    }),

  // File Organizer
  scanFolder: (folder_path: string, recursive: boolean = false) =>
    request<ScanResponse>('/files/scan', {
      method: 'POST',
      body: JSON.stringify({ folder_path, recursive })
    }),
  proposeOrganization: (folder_path: string, file_paths?: string[]) =>
    request<OrganizeProposalResponse>('/files/propose', {
      method: 'POST',
      body: JSON.stringify({ folder_path, file_paths })
    }),
  executeOrganization: (folder_path: string, proposals: any[], dry_run: boolean = false) =>
    request<ExecuteOrganizeResponse>('/files/execute', {
      method: 'POST',
      body: JSON.stringify({ folder_path, proposals, dry_run })
    }),
  undoOrganization: (task_id?: string) =>
    request<{ success: boolean; reverted_count: number; errors: string[] }>('/files/undo', {
      method: 'POST',
      body: JSON.stringify({ task_id })
    }),

  // Morning Briefing
  generateBriefing: (text_content?: string, file_paths?: string[]) =>
    request<BriefingResponse>('/briefing/generate', {
      method: 'POST',
      body: JSON.stringify({ text_content, file_paths })
    }),

  // Task Crusher
  crushTask: (task_description: string, procrastination_level: string = 'moderate') =>
    request<TaskCrusherResponse>('/crusher/crush', {
      method: 'POST',
      body: JSON.stringify({ task_description, procrastination_level })
    }),
  generateStarter: (task_description: string, step_title: string) =>
    request<{ starter_content: string; asset_type: string }>('/crusher/starter', {
      method: 'POST',
      body: JSON.stringify({ task_description, step_title })
    }),

  // Document Assistant
  processDocument: (action: string, text?: string, file_path?: string) =>
    request<DocumentProcessResponse>('/documents/process', {
      method: 'POST',
      body: JSON.stringify({ action, text, file_path })
    }),

  // Autopilot
  getAutopilotQueue: () =>
    request<{ tasks: AutopilotTask[]; pending_count: number }>('/autopilot/queue'),
  handleAutopilotAction: (task_id: string, action: 'approve' | 'reject' | 'execute') =>
    request<{ task_id: string; status: string; message: string; result?: any }>('/autopilot/action', {
      method: 'POST',
      body: JSON.stringify({ task_id, action })
    }),

  // Activity History & Privacy
  getHistory: () =>
    request<{ history: TaskHistoryItem[] }>('/history'),
  clearHistory: () =>
    request<{ success: boolean; message: string }>('/history/clear', {
      method: 'DELETE'
    })
};
