import React, { useState } from 'react';
import {
  Coffee,
  Sparkles,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckSquare,
  Copy,
  Download,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { BriefingResponse } from '../types';
import { api } from '../services/api';

interface MorningBriefingViewProps {
  onTaskCompleted: () => void;
}

export const MorningBriefingView: React.FC<MorningBriefingViewProps> = ({ onTaskCompleted }) => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const handleGenerate = async () => {
    if (!inputText.trim() && !selectedFilePath.trim()) return;
    setLoading(true);

    try {
      const res = await api.generateBriefing(
        inputText.trim() || undefined,
        selectedFilePath ? [selectedFilePath] : undefined
      );
      setBriefing(res);
      setCheckedItems({});
      onTaskCompleted();
    } catch (err: any) {
      alert(`Error generating briefing: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!briefing) return;
    const md = `# Lazy Morning Briefing\n\n${briefing.summary}\n\n## Key Points\n${briefing.key_points.map((p) => `- ${p}`).join('\n')}\n\n## What Needs Your Attention\n${briefing.what_needs_attention.map((w) => `⭐ ${w}`).join('\n')}\n\n## Action Items\n${briefing.action_items.map((a) => `- [ ] ${a}`).join('\n')}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!briefing) return;
    const md = `# Lazy Morning Briefing\n\n${briefing.summary}\n\n## Key Points\n${briefing.key_points.map((p) => `- ${p}`).join('\n')}\n\n## What Needs Your Attention\n${briefing.what_needs_attention.map((w) => `⭐ ${w}`).join('\n')}\n\n## Deadlines\n${briefing.deadlines.map((d) => `- ${d.date}: ${d.task} (${d.urgency})`).join('\n')}\n\n## Action Items\n${briefing.action_items.map((a) => `- [ ] ${a}`).join('\n')}`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `morning_briefing_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Coffee className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            <span>Lazy Morning Briefing</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Import chat logs, meeting transcripts, and project notes. Receive a 5-point digest with zero fluff.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-semibold">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Under 2-Minute Read Time</span>
        </div>
      </div>

      {/* Input Selection & Previews */}
      <div className="sloth-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Source Notes or Chat Export
          </label>
          {/* Sample Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Try Sample:</span>
            <button
              onClick={() => {
                setSelectedFilePath('demo_workspace/Notes_and_Chats/team_slack_export_weekly.txt');
                setInputText('');
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              💬 Slack Chat Export
            </button>
            <button
              onClick={() => {
                setSelectedFilePath('demo_workspace/Notes_and_Chats/project_brainstorm_notes.md');
                setInputText('');
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              📝 Project Brainstorm Notes
            </button>
          </div>
        </div>

        {selectedFilePath ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-emerald-900 dark:text-emerald-200">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Loaded File: {selectedFilePath}</span>
            </div>
            <button
              onClick={() => setSelectedFilePath('')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
            >
              Clear
            </button>
          </div>
        ) : (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder="Paste your meeting notes, slack chat export, or project roadmap here..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-100 font-mono resize-y"
          />
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            *Treated strictly as untrusted data block. Processed locally.
          </span>
          <button
            onClick={handleGenerate}
            disabled={loading || (!inputText.trim() && !selectedFilePath.trim())}
            className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing Briefing...' : 'Synthesize Lazy Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Generated Briefing Display Card */}
      {briefing && (
        <div className="sloth-card-glow p-6 sm:p-8 space-y-6">
          {/* Top Bar with Export buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-emerald-950/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  {briefing.model_name}
                </span>
                <span className="text-xs text-slate-400">
                  Estimated read time: ~{briefing.estimated_reading_minutes} min
                </span>
              </div>
              <h2 className="font-outfit font-extrabold text-xl text-slate-900 dark:text-slate-100 mt-1">
                Your 5-Point Lazy Briefing
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          {/* Overview summary */}
          <p className="text-sm text-slate-600 dark:text-slate-300 italic border-l-4 border-amber-500 pl-3">
            "{briefing.summary}"
          </p>

          {/* ⭐ What actually needs my attention? (High-Priority Callout) */}
          {briefing.what_needs_attention && briefing.what_needs_attention.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>What Actually Needs Your Attention Today</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                {briefing.what_needs_attention.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">★</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5 Key Points Grid */}
          <div className="space-y-3">
            <h3 className="font-outfit font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Top Key Takeaways (Max 5)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {briefing.key_points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200/60 dark:border-emerald-900/30 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {pt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items with checkboxes */}
          {briefing.action_items && briefing.action_items.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-outfit font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Action Items Checklist</span>
              </h3>
              <div className="space-y-2">
                {briefing.action_items.map((act, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-emerald-950/20 border border-slate-200/60 dark:border-emerald-900/30 flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[idx]}
                      onChange={() => {}}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span
                      className={`text-xs sm:text-sm ${
                        checkedItems[idx]
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {act}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadlines Timeline & Unresolved Questions in 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Deadlines */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming Deadlines</span>
              </h4>
              <div className="space-y-2">
                {briefing.deadlines.map((dl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200/60 dark:border-emerald-900/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {dl.task}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {dl.date}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        dl.urgency === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-emerald-950/40 dark:text-slate-300'
                      }`}
                    >
                      {dl.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unresolved Questions */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Unresolved Questions</span>
              </h4>
              <div className="space-y-2">
                {briefing.unresolved_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200/60 dark:border-emerald-900/30 text-xs text-slate-700 dark:text-slate-300"
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
