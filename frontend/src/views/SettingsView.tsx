import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Terminal,
  CheckCircle,
  ExternalLink,
  HardDrive,
  Info
} from 'lucide-react';
import { HealthResponse } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  health: HealthResponse | null;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  onRefreshHealth,
}) => {
  const [switching, setSwitching] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(
    health?.active_model || 'qwen2.5-coder:7b'
  );
  const [msg, setMsg] = useState<string | null>(null);

  const handleSwitchModel = async (modelName: string) => {
    setSelectedModel(modelName);
    setSwitching(true);
    setMsg(null);
    try {
      await api.switchModel(modelName);
      setMsg(`Active model successfully switched to ${modelName}.`);
      onRefreshHealth();
    } catch (err: any) {
      alert(`Model switch failed: ${err.message || err}`);
    } finally {
      setSwitching(false);
    }
  };

  const isOnline = health?.ollama_online ?? false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Settings & Model Adapter</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Configure local open-weight models, verify runtime latency, and manage security sandbox boundaries.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Ollama Runtime Status Card */}
      <div className="sloth-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Ollama Local Inference Runtime</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isOnline
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}
                >
                  {isOnline ? 'Online (Ready)' : 'Offline / Standby'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Host URL: <code className="font-mono">http://127.0.0.1:11434</code> • Latency:{' '}
                {health?.latency_ms ? `${Math.round(health.latency_ms)}ms` : 'N/A'}
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshHealth}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Connection</span>
          </button>
        </div>

        {/* Model Selector Dropdown */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200/80 dark:border-emerald-900/40 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            Active Open-Weight Model
          </label>

          {health?.available_models && health.available_models.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {health.available_models.map((m) => {
                const isSelected = selectedModel === m.name;
                return (
                  <div
                    key={m.name}
                    onClick={() => handleSwitchModel(m.name)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-[#121f18] border-slate-200 dark:border-emerald-900/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {m.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      Size: {m.size}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No local models detected on Ollama yet. Pull one below using the terminal guide.
            </p>
          )}
        </div>
      </div>

      {/* Model Setup Guide */}
      <div className="sloth-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
          <Terminal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Local Model Installation Guide</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          SlothOS works with any instruction-tuned model supported by Ollama. For the best balance
          of speed and reasoning on consumer laptops, we recommend Qwen 2.5 (7B) or Llama 3.2 (3B).
        </p>

        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200">
            <span className="text-slate-500"># Recommended: Qwen 2.5 Coder 7B</span>
            <div className="text-emerald-400 mt-1">ollama pull qwen2.5-coder:7b</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200">
            <span className="text-slate-500"># Lightweight alternative: Llama 3.2 3B</span>
            <div className="text-emerald-400 mt-1">ollama pull llama3.2:3b</div>
          </div>
        </div>
      </div>

      {/* Security & Sandbox Bounds */}
      <div className="sloth-card p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
          <HardDrive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Filesystem Sandboxing & Safety Bounds</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          To protect user privacy and system stability, SlothOS verifies all path resolutions against
          directory escape (path traversal), blocks OS root drives, and creates atomic undo manifests
          in local SQLite before touching any file.
        </p>
      </div>
    </div>
  );
};
