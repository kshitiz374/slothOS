import React, { useState } from 'react';
import {
  FolderOpen,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  FileText,
  FileImage,
  DollarSign,
  GraduationCap,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { FileInfo, ProposedFileAction, ScanResponse, OrganizeProposalResponse } from '../types';
import { api } from '../services/api';

interface FileOrganizerViewProps {
  onTaskCompleted: () => void;
}

export const FileOrganizerView: React.FC<FileOrganizerViewProps> = ({ onTaskCompleted }) => {
  // Default to relative or absolute demo path
  const [folderPath, setFolderPath] = useState<string>('demo_workspace/Messy_Downloads');
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  
  const [proposing, setProposing] = useState<boolean>(false);
  const [proposalResult, setProposalResult] = useState<OrganizeProposalResponse | null>(null);

  const [dryRun, setDryRun] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);
  const [undoing, setUndoing] = useState<boolean>(false);

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'documents':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-emerald-500" />;
      case 'images':
        return <FileImage className="w-4 h-4 text-purple-500" />;
      case 'finance':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'academic':
        return <GraduationCap className="w-4 h-4 text-cyan-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleScan = async () => {
    if (!folderPath.trim()) return;
    setScanning(true);
    setStatusMessage(null);
    setProposalResult(null);

    try {
      const res = await api.scanFolder(folderPath.trim());
      setScanResult(res);
      setStatusMessage({
        type: 'info',
        text: `Scanned ${res.total_files} files (${res.total_readable}) in folder.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error scanning directory' });
    } finally {
      setScanning(false);
    }
  };

  const handlePropose = async () => {
    if (!scanResult || scanResult.files.length === 0) return;
    setProposing(true);
    setStatusMessage(null);

    try {
      const res = await api.proposeOrganization(scanResult.folder_path);
      setProposalResult(res);
      setStatusMessage({
        type: 'success',
        text: `AI analyzed ${res.total_proposed} files using ${res.model_name}. Review proposed changes below.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error generating AI proposals' });
    } finally {
      setProposing(false);
    }
  };

  const handleExecute = async () => {
    if (!proposalResult || proposalResult.proposals.length === 0) return;
    setExecuting(true);
    setStatusMessage(null);

    try {
      const res = await api.executeOrganization(
        proposalResult.folder_path,
        proposalResult.proposals,
        dryRun
      );
      if (res.dry_run) {
        setStatusMessage({
          type: 'info',
          text: `[Dry Run] Simulated move of ${res.success_count} files safely with zero changes made to disk.`,
        });
      } else {
        setLastTaskId(res.task_id);
        setStatusMessage({
          type: 'success',
          text: `Successfully organized ${res.success_count} files! Undo manifest saved.`,
        });
        onTaskCompleted();
        // Re-scan to show updated folder structure
        handleScan();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error executing file organization' });
    } finally {
      setExecuting(false);
    }
  };

  const handleUndo = async () => {
    setUndoing(true);
    try {
      const res = await api.undoOrganization(lastTaskId || undefined);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Undid previous batch! Reverted ${res.reverted_count} files back to original positions.`,
        });
        setLastTaskId(null);
        onTaskCompleted();
        handleScan();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.errors.join(', ') || 'No operations could be undone.',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error during undo' });
    } finally {
      setUndoing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Sandbox Guard Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FolderOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Sloth Inbox — Digital Clutter Cleaner</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Quietly cleans messy directories. Previews every single rename and category move before touching disk.
          </p>
        </div>

        {/* Safety Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Collision Detection & 1-Click Rollback Enabled</span>
        </div>
      </div>

      {/* Folder Selection Card */}
      <div className="sloth-card p-6 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Target Directory to Organize
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="e.g. demo_workspace/Messy_Downloads or C:/Users/.../Downloads"
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-slate-100 font-mono"
          />
          <button
            onClick={handleScan}
            disabled={scanning || !folderPath.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 flex-shrink-0"
          >
            <Search className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning...' : 'Scan Folder'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Presets:</span>
          <button
            onClick={() => {
              setFolderPath('demo_workspace/Messy_Downloads');
              setScanResult(null);
              setProposalResult(null);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            📁 Sample Messy Downloads
          </button>
          <button
            onClick={() => {
              setFolderPath('demo_workspace/Notes_and_Chats');
              setScanResult(null);
              setProposalResult(null);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            📄 Sample Notes Workspace
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-900 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-900 dark:text-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : statusMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          )}
          <span className="mt-0.5">{statusMessage.text}</span>
        </div>
      )}

      {/* Scanned Files Section */}
      {scanResult && (
        <div className="sloth-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-slate-100">
                Discovered Files ({scanResult.total_files})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total size: {scanResult.total_readable} • Location: {scanResult.folder_path}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePropose}
                disabled={proposing || scanResult.total_files === 0}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Sparkles className={`w-4 h-4 ${proposing ? 'animate-spin' : ''}`} />
                <span>{proposing ? 'Consulting Sloth AI...' : 'Ask AI to Propose Clean Structure'}</span>
              </button>

              {lastTaskId && (
                <button
                  onClick={handleUndo}
                  disabled={undoing}
                  className="px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-xs border border-amber-300/40 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${undoing ? 'animate-spin' : ''}`} />
                  <span>Undo Last Move</span>
                </button>
              )}
            </div>
          </div>

          {/* Proposal Preview Table */}
          {proposalResult ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-slate-200/60 dark:border-emerald-900/30 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Proposed Categories: Documents, Code, Images, Academic, Finance, Miscellaneous
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Dry-Run Mode (Simulate Only)</span>
                  </label>
                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{dryRun ? 'Simulate Dry Run' : 'Execute & Organize'}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-emerald-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-emerald-950/50 text-slate-600 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/80 dark:border-emerald-900/40">
                    <tr>
                      <th className="p-3">Original File</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Proposed Clean Filename</th>
                      <th className="p-3">Reason / Rationale</th>
                      <th className="p-3 text-right">Collision Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/30 bg-white/50 dark:bg-[#0e1a14]/50">
                    {proposalResult.proposals.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-emerald-900/20">
                        <td className="p-3 font-mono text-slate-700 dark:text-slate-300 font-medium">
                          {p.original_filename}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-emerald-950/60 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-emerald-800/40">
                            {getCategoryIcon(p.suggested_category)}
                            <span>{p.suggested_category}</span>
                          </span>
                        </td>
                        <td className="p-3 font-mono text-emerald-800 dark:text-emerald-300 font-semibold">
                          {p.suggested_filename}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">
                          {p.reason}
                        </td>
                        <td className="p-3 text-right">
                          {p.is_conflict ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold" title="Collision resolved by auto-suffix">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Auto-Suffix</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <Check className="w-3.5 h-3.5" />
                              <span>Safe Path</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Uncategorized Initial List */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
              {scanResult.files.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200/60 dark:border-emerald-900/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                      {file.filename}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono ml-2 flex-shrink-0">
                    {file.size_readable}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
