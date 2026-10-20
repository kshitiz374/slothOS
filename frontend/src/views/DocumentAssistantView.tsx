import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  ListChecks,
  Calendar,
  FileCode2,
  Copy,
  Download,
  Check,
  RotateCw
} from 'lucide-react';
import { DocumentProcessResponse } from '../types';
import { api } from '../services/api';

interface DocumentAssistantViewProps {
  onTaskCompleted: () => void;
}

export const DocumentAssistantView: React.FC<DocumentAssistantViewProps> = ({ onTaskCompleted }) => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [action, setAction] = useState<string>('summarize');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentProcessResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const actions = [
    { id: 'summarize', label: 'Summarize Document', icon: FileText },
    { id: 'extract_dates', label: 'Extract Deadlines & Dates', icon: Calendar },
    { id: 'convert_checklist', label: 'Convert to Checklist', icon: ListChecks },
    { id: 'clean_markdown', label: 'Format Clean Markdown', icon: FileCode2 },
  ];

  const handleProcess = async () => {
    if (!inputText.trim() && !selectedFilePath.trim()) return;
    setLoading(true);

    try {
      const res = await api.processDocument(
        action,
        inputText.trim() || undefined,
        selectedFilePath || undefined
      );
      setResult(res);
      onTaskCompleted();
    } catch (err: any) {
      alert(`Error processing document: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.processed_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.processed_content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slothos_${action}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>One-Click Document Assistant</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Transform lengthy PDFs, unstructured brainstorms, and raw text into crisp executive summaries and actionable checklists.
          </p>
        </div>
      </div>

      {/* Action Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          const isSelected = action === act.id;
          return (
            <button
              key={act.id}
              onClick={() => setAction(act.id)}
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-900/20'
                  : 'bg-white dark:bg-[#121f18] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900/40 hover:bg-slate-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Card */}
      <div className="sloth-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Document Content or File Path
          </label>
          {/* Sample preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400">Load sample:</span>
            <button
              onClick={() => {
                setSelectedFilePath('demo_workspace/Notes_and_Chats/client_feedback_q4.txt');
                setInputText('');
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 text-xs font-medium"
            >
              💬 Client Feedback Notes
            </button>
            <button
              onClick={() => {
                setSelectedFilePath('demo_workspace/Notes_and_Chats/project_brainstorm_notes.md');
                setInputText('');
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 text-xs font-medium"
            >
              📝 Project Brainstorm
            </button>
          </div>
        </div>

        {selectedFilePath ? (
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between text-xs">
            <span className="font-mono text-indigo-900 dark:text-indigo-200">
              Loaded: {selectedFilePath}
            </span>
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
            rows={6}
            placeholder="Paste your lengthy document, paper excerpt, meeting transcript, or unformatted notes here..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 font-mono resize-y"
          />
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            *Safe local processing. Private notes never leave device.
          </span>
          <button
            onClick={handleProcess}
            disabled={loading || (!inputText.trim() && !selectedFilePath.trim())}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Processing Document...' : 'Run Assistant'}</span>
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="sloth-card-glow p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-emerald-950/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                  {result.model_name}
                </span>
                <span className="text-xs text-slate-400">
                  Original: {result.original_length} characters
                </span>
              </div>
              <h2 className="font-outfit font-extrabold text-xl text-slate-900 dark:text-slate-100 mt-1 capitalize">
                {result.action.replace('_', ' ')} Result
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0c1611] border border-slate-200/80 dark:border-emerald-900/40 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
            {result.processed_content}
          </div>
        </div>
      )}
    </div>
  );
};
