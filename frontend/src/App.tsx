import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PrivacyNotice } from './components/PrivacyNotice';
import { DashboardView } from './views/DashboardView';
import { FileOrganizerView } from './views/FileOrganizerView';
import { MorningBriefingView } from './views/MorningBriefingView';
import { ProcrastinationView } from './views/ProcrastinationView';
import { DocumentAssistantView } from './views/DocumentAssistantView';
import { AutopilotView } from './views/AutopilotView';
import { ActivityHistoryView } from './views/ActivityHistoryView';
import { SettingsView } from './views/SettingsView';
import { HealthResponse, StatsResponse, AutopilotTask, TaskHistoryItem } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [autopilotTasks, setAutopilotTasks] = useState<AutopilotTask[]>([]);
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);

  // Dark mode initialized from localStorage or OS preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('slothos_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('slothos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('slothos_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Fetch all app data
  const loadData = async () => {
    try {
      setHealthLoading(true);
      const [h, s, q, hist] = await Promise.allSettled([
        api.getHealth(),
        api.getStats(),
        api.getAutopilotQueue(),
        api.getHistory()
      ]);

      if (h.status === 'fulfilled') setHealth(h.value);
      if (s.status === 'fulfilled') setStats(s.value);
      if (q.status === 'fulfilled') setAutopilotTasks(q.value.tasks);
      if (hist.status === 'fulfilled') setHistory(hist.value.history);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveAutopilot = async (taskId: string) => {
    try {
      await api.handleAutopilotAction(taskId, 'approve');
      loadData();
    } catch (e: any) {
      alert(`Approval error: ${e.message || e}`);
    }
  };

  const handleRejectAutopilot = async (taskId: string) => {
    try {
      await api.handleAutopilotAction(taskId, 'reject');
      loadData();
    } catch (e: any) {
      alert(`Reject error: ${e.message || e}`);
    }
  };

  const pendingApprovalsCount = autopilotTasks.filter((t) => t.status === 'suggested').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcf9] dark:bg-[#08100b] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        health={health}
        healthLoading={healthLoading}
        onRefreshHealth={loadData}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Persistent Privacy Guarantee Banner */}
        <PrivacyNotice />

        {/* View Switcher */}
        {currentView === 'dashboard' && (
          <DashboardView
            stats={stats}
            autopilotTasks={autopilotTasks}
            recentHistory={history}
            onNavigate={setCurrentView}
            onApproveAutopilot={handleApproveAutopilot}
            onRejectAutopilot={handleRejectAutopilot}
          />
        )}

        {currentView === 'inbox' && (
          <FileOrganizerView onTaskCompleted={loadData} />
        )}

        {currentView === 'briefing' && (
          <MorningBriefingView onTaskCompleted={loadData} />
        )}

        {currentView === 'crusher' && (
          <ProcrastinationView onTaskCompleted={loadData} />
        )}

        {currentView === 'documents' && (
          <DocumentAssistantView onTaskCompleted={loadData} />
        )}

        {currentView === 'autopilot' && (
          <AutopilotView
            tasks={autopilotTasks}
            onRefresh={loadData}
            onTaskCompleted={loadData}
          />
        )}

        {currentView === 'history' && (
          <ActivityHistoryView
            history={history}
            onRefresh={loadData}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            health={health}
            onRefreshHealth={loadData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/60 dark:border-emerald-950/40 py-6 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">SlothOS</span>
            <span>•</span>
            <span>Hacktoberfest Open-Source AI Challenge Week 3 ("Slow and Steady")</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Ollama & Open-Weight SLMs</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Local First</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
