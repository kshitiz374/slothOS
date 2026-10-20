import React, { useState } from 'react';
import {
  Bot,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Play,
  RotateCw,
  FolderOpen,
  Coffee,
  CheckCircle2,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { AutopilotTask } from '../types';
import { api } from '../services/api';

interface AutopilotViewProps {
  tasks: AutopilotTask[];
  onRefresh: () => void;
  onTaskCompleted: () => void;
}

export const AutopilotView: React.FC<AutopilotViewProps> = ({
  tasks,
  onRefresh,
  onTaskCompleted,
}) => {
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<{ [id: string]: any }>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'pending') return t.status === 'suggested';
    if (activeTab === 'completed') return t.status === 'completed';
    return true;
  });

  const handleAction = async (taskId: string, action: 'approve' | 'reject' | 'execute') => {
    setExecutingId(taskId);
    try {
      const res = await api.handleAutopilotAction(taskId, action);
      if (res.result) {
        setExecutionLogs((prev) => ({ ...prev, [taskId]: res.result }));
      }
      onRefresh();
      onTaskCompleted();
    } catch (err: any) {
      alert(`Action error: ${err.message || err}`);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Sloth Autopilot</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Proactive background assistance with 100% human-in-the-loop oversight. You review and approve every action.
          </p>
        </div>

        {/* Security Scope Card */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Zero Arbitrary Shell Execution • Strict Sandbox Scope</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(['pending', 'completed', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#121f18] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-emerald-900/40 hover:bg-slate-100'
            }`}
          >
            {tab} Tasks
          </button>
        ))}
      </div>

      {/* Task Queue List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="sloth-card p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60" />
            <h3 className="font-outfit font-bold text-base text-slate-800 dark:text-slate-200">
              No tasks found in this view
            </h3>
            <p className="text-xs text-slate-400">
              Sloth Autopilot is peacefully sleeping. Check back later or trigger a manual scan.
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isExecuting = executingId === t.id;
            const log = executionLogs[t.id];
            return (
              <div key={t.id} className="sloth-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {t.category}
                      </span>
                      <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-slate-100">
                        {t.title}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : t.status === 'rejected'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {t.description}
                    </p>
                  </div>

                  {/* Actions */}
                  {t.status === 'suggested' && (
                    <div className="flex items-center gap-2.5 flex-shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleAction(t.id, 'reject')}
                        disabled={isExecuting}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <span>Dismiss</span>
                      </button>
                      <button
                        onClick={() => handleAction(t.id, 'approve')}
                        disabled={isExecuting}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <CheckCircle className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
                        <span>{isExecuting ? 'Executing...' : 'Approve & Run'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Execution Result Log Preview */}
                {log && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Execution Result:</span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] text-slate-300">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
