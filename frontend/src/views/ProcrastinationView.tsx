import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Clock,
  HeartHandshake,
  FileCode,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Coffee
} from 'lucide-react';
import { TaskCrusherResponse } from '../types';
import { api } from '../services/api';

interface ProcrastinationViewProps {
  onTaskCompleted: () => void;
}

export const ProcrastinationView: React.FC<ProcrastinationViewProps> = ({ onTaskCompleted }) => {
  const [taskInput, setTaskInput] = useState<string>('');
  const [level, setLevel] = useState<string>('moderate');
  const [loading, setLoading] = useState<boolean>(false);
  const [crushedPlan, setCrushedPlan] = useState<TaskCrusherResponse | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  const presets = [
    'Organize messy tax invoices and receipts',
    'Write introduction draft for research paper',
    'Refactor complex database migration script',
    'Write email explaining delayed project timeline',
  ];

  const handleCrush = async (taskToCrush?: string) => {
    const text = taskToCrush || taskInput;
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await api.crushTask(text.trim(), level);
      setCrushedPlan(res);
      setCompletedSteps({});
      onTaskCompleted();
    } catch (err: any) {
      alert(`Error crushing task: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const handleCopyDraft = () => {
    if (!crushedPlan?.first_draft_preview) return;
    navigator.clipboard.writeText(crushedPlan.first_draft_preview);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Procrastination Crusher</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Zero guilt. Zero streaks. Break overwhelming projects into 2–8 minute low-friction micro-actions.
          </p>
        </div>

        {/* Anti-Hustle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold">
          <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Guilt-Free Productivity Philosophy</span>
        </div>
      </div>

      {/* Task Input Card */}
      <div className="sloth-card p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          What task have you been putting off?
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="e.g. Write chapter 2 of my thesis, or file business expenses"
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100"
          />
          <button
            onClick={() => handleCrush()}
            disabled={loading || !taskInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 flex-shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Crushing Resistance...' : 'Crush This Task'}</span>
          </button>
        </div>

        {/* Severity selection */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Anxiety Level:</span>
            {(['mild', 'moderate', 'overwhelming'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  level === lvl
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400">Quick ideas:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTaskInput(p);
                  handleCrush(p);
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-emerald-950/30 hover:bg-slate-200 dark:hover:bg-emerald-900/50 text-slate-700 dark:text-slate-300 text-[11px] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crushed Plan Output Card */}
      {crushedPlan && (
        <div className="sloth-card-glow p-6 sm:p-8 space-y-6">
          {/* Sloth Verdict */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>The Sloth Verdict</span>
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 italic font-medium">
                "{crushedPlan.sloth_verdict}"
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                Strategy: {crushedPlan.minimum_effort_strategy}
              </p>
            </div>

            <div className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800/40 text-slate-500 dark:text-slate-400 flex-shrink-0">
              {crushedPlan.model_name}
            </div>
          </div>

          {/* Micro-Steps List */}
          <div className="space-y-3">
            <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Your 5-Minute Micro-Steps</span>
              <span className="text-xs font-normal text-slate-400">
                Check off each step as you complete it
              </span>
            </h3>

            <div className="space-y-3">
              {crushedPlan.micro_steps.map((step) => {
                const isDone = !!completedSteps[step.step_number];
                return (
                  <div
                    key={step.step_number}
                    onClick={() => toggleStep(step.step_number)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50 opacity-70'
                        : 'bg-white dark:bg-[#121f18] border-slate-200/80 dark:border-emerald-900/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                          className="h-5 w-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-semibold text-sm ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            Step {step.step_number}: {step.title}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-emerald-950/60 text-slate-600 dark:text-slate-300">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>{step.estimated_minutes} min</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          💡 <span className="italic font-medium">{step.low_friction_tip}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1-Click Starter Draft Preview */}
          {crushedPlan.first_draft_preview && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-outfit font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    1-Click Starter Draft (Never Face a Blank Page)
                  </h3>
                </div>
                <button
                  onClick={handleCopyDraft}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedDraft ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedDraft ? 'Copied!' : 'Copy Starter Draft'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 max-h-64 whitespace-pre-wrap">
                {crushedPlan.first_draft_preview}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
