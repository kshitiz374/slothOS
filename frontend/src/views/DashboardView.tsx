import React from 'react';
import {
  Sparkles,
  Clock,
  FolderCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FolderOpen,
  Coffee,
  CheckCircle2,
  FileText,
  Bot,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { StatsResponse, AutopilotTask, TaskHistoryItem } from '../types';

interface DashboardViewProps {
  stats: StatsResponse | null;
  autopilotTasks: AutopilotTask[];
  recentHistory: TaskHistoryItem[];
  onNavigate: (view: string) => void;
  onApproveAutopilot: (taskId: string) => void;
  onRejectAutopilot: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  autopilotTasks,
  recentHistory,
  onNavigate,
  onApproveAutopilot,
  onRejectAutopilot,
}) => {
  const pendingTasks = autopilotTasks.filter((t) => t.status === 'suggested');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden sloth-card-glow p-6 sm:p-8 bg-gradient-to-br from-emerald-900/90 via-[#0e2a1e] to-[#0a1811] text-white">
        {/* Background ambient lighting */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hacktoberfest Week 3 • Slow and Steady</span>
            </div>
            <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight text-cream-100">
              Good morning. Your sloth has been busy.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Sit back with a warm cup of tea. SlothOS handles the tedious file sorting,
              meeting digests, and scary task breakdowns quietly on your own machine.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onNavigate('inbox')}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform active:scale-95"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Clean Messy Folder</span>
              </button>
              <button
                onClick={() => onNavigate('briefing')}
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/10 backdrop-blur-sm transition-all"
              >
                <Coffee className="w-4 h-4 text-amber-300" />
                <span>Generate Morning Briefing</span>
              </button>
            </div>
          </div>

          {/* Sleeping / Relaxing Sloth Image */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-2 border-emerald-400/30 shadow-2xl flex-shrink-0 animate-float-slow">
            <img
              src="/sloth_sleep.jpg"
              alt="Sloth Relaxing in Hammock"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Completed */}
        <div className="sloth-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Tasks Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-slate-100">
            {stats?.tasks_completed ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Executed with zero human stress
          </p>
        </div>

        {/* Estimated Time Saved */}
        <div className="sloth-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Estimated Time Saved</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-slate-100">
            ~{stats?.estimated_minutes_saved ?? 0} <span className="text-base font-normal text-slate-500">mins</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400/80 font-medium">
            *Clearly labeled heuristic estimate
          </p>
        </div>

        {/* Files Organized */}
        <div className="sloth-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Files Organized</span>
            <FolderCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-slate-100">
            {stats?.files_organized ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Protected with 1-click rollback
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="sloth-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 dark:text-slate-100">
            {pendingTasks.length}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Never runs without your OK
          </p>
        </div>
      </div>

      {/* Main Grid: Pending Autopilot Approvals & Quick Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pending Approvals / Autopilot Highlights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="sloth-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-slate-100">
                  Sloth Autopilot Queue
                </h2>
              </div>
              <button
                onClick={() => onNavigate('autopilot')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              SlothOS identifies repetitive tasks and presents them for your explicit review.
              Nothing runs in the background until approved.
            </p>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-dashed border-slate-200 dark:border-emerald-900/40">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/80 mb-2" />
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Your queue is calm and clear!
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  No automated chores awaiting your decision. Relax and enjoy your day.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-emerald-950/20 border border-slate-200/80 dark:border-emerald-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                          {task.category}
                        </span>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {task.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        onClick={() => onRejectAutopilot(task.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => onApproveAutopilot(task.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Launchers Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => onNavigate('inbox')}
              className="sloth-card p-5 cursor-pointer hover:border-emerald-500/50 group space-y-2"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Sloth Inbox
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan and organize cluttered downloads into tidy categories with preview.
              </p>
            </div>

            <div
              onClick={() => onNavigate('crusher')}
              className="sloth-card p-5 cursor-pointer hover:border-emerald-500/50 group space-y-2"
            >
              <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Task Crusher
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Break intimidating tasks into microscopic 2-5 min steps with starter templates.
              </p>
            </div>

            <div
              onClick={() => onNavigate('documents')}
              className="sloth-card p-5 cursor-pointer hover:border-emerald-500/50 group space-y-2"
            >
              <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Doc Assistant
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Summarize lengthy PDFs, extract deadlines, and format notes into markdown.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Activity Log */}
        <div className="sloth-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-slate-100">
                Recent Activity
              </h2>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Audit Log
              </button>
            </div>

            {recentHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No recent actions yet. Try cleaning the demo workspace!
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200/60 dark:border-emerald-900/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        +{Math.round(item.estimated_seconds_saved / 60)}m
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Undo shortcut */}
          <div className="pt-4 border-t border-slate-100 dark:border-emerald-950/60">
            <button
              onClick={() => onNavigate('history')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Undo Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
