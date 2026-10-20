import React from 'react';
import { ShieldCheck, Cpu, AlertCircle, RefreshCw } from 'lucide-react';
import { HealthResponse } from '../types';

interface ModelBadgeProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const ModelBadge: React.FC<ModelBadgeProps> = ({
  health,
  loading,
  onRefresh,
  onOpenSettings,
}) => {
  const isOnline = health?.ollama_online ?? false;
  const modelName = health?.active_model || 'qwen2.5-coder:7b';
  const latency = health?.latency_ms ? `${Math.round(health.latency_ms)}ms` : null;

  return (
    <div className="flex items-center gap-2">
      {/* Privacy Shield Tag */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>100% Local Inference</span>
      </div>

      {/* Model Status Pill */}
      <button
        onClick={onOpenSettings}
        title="Click to switch models or configure Ollama"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-800/40 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          {isOnline ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          )}
        </span>

        <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[130px] truncate">
          {isOnline ? modelName : 'Offline Mode'}
        </span>

        {latency && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {latency}
          </span>
        )}
      </button>

      {/* Refresh Status Button */}
      <button
        onClick={onRefresh}
        disabled={loading}
        title="Check Ollama Connection"
        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-emerald-900/40"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
