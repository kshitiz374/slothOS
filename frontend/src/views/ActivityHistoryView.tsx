import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Coffee,
  CheckCircle,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { TaskHistoryItem } from '../types';
import { api } from '../services/api';

interface ActivityHistoryViewProps {
  history: TaskHistoryItem[];
  onRefresh: () => void;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  history,
  onRefresh,
}) => {
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleUndo = async (taskId: string) => {
    setUndoingId(taskId);
    setStatusMsg(null);
    try {
      const res = await api.undoOrganization(taskId);
      if (res.success) {
        setStatusMsg(`Successfully reverted ${res.reverted_count} files for task ${taskId.slice(0, 8)}...`);
        onRefresh();
      } else {
        alert(res.errors.join(', ') || 'Failed to revert');
      }
    } catch (err: any) {
      alert(`Undo error: ${err.message || err}`);
    } finally {
      setUndoingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Privacy Action: Are you sure you want to permanently wipe all local task history and undo manifests?')) {
      return;
    }
    setClearing(true);
    try {
      await api.clearHistory();
      setStatusMsg('All local history and manifests have been permanently wiped from SQLite.');
      onRefresh();
    } catch (err: any) {
      alert(`Clear error: ${err.message || err}`);
    } finally {
      setClearing(false);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'file_organize':
        return <FolderOpen className="w-4 h-4 text-emerald-500" />;
      case 'morning_briefing':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'task_crush':
        return <CheckCircle2 className="w-4 h-4 text-teal-500" />;
      case 'doc_summary':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Activity History & Undo Ledger</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Complete audit trail of all automated actions with 1-click rollbacks and privacy controls.
          </p>
        </div>

        {/* Wipe Data Privacy Button */}
        <button
          onClick={handleClearAll}
          disabled={clearing || history.length === 0}
          className="px-4 py-2 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          <span>Wipe All Local History</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* History Table Card */}
      <div className="sloth-card p-6 space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No activity history recorded. Execute a file organization or briefing to see events here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-emerald-950/40">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTaskIcon(item.task_type)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          item.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : item.status === 'reverted'
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                      <span>{item.created_at}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{Math.round(item.estimated_seconds_saved / 60)} min saved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Undo Action if File Organize and not already reverted */}
                {item.task_type === 'file_organize' && item.status !== 'reverted' && (
                  <button
                    onClick={() => handleUndo(item.id)}
                    disabled={undoingId === item.id}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-center flex-shrink-0"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${undoingId === item.id ? 'animate-spin' : ''}`} />
                    <span>Rollback</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
