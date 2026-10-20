import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Coffee,
  CheckCircle2,
  FileText,
  Bot,
  History,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { ModelBadge } from './ModelBadge';
import { HealthResponse } from '../types';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  health: HealthResponse | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  health,
  healthLoading,
  onRefreshHealth,
  darkMode,
  onToggleDarkMode,
  pendingApprovalsCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Sloth Inbox', icon: FolderOpen },
    { id: 'briefing', label: 'Morning Briefing', icon: Coffee },
    { id: 'crusher', label: 'Task Crusher', icon: CheckCircle2 },
    { id: 'documents', label: 'Doc Assistant', icon: FileText },
    {
      id: 'autopilot',
      label: 'Autopilot',
      icon: Bot,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'history', label: 'History & Undo', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0c1611]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-emerald-950/60 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand and Mascot */}
        <div
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-sm group-hover:scale-105 transition-transform">
            <img
              src="/sloth_mascot.jpg"
              alt="SlothOS Mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-outfit font-bold text-lg text-emerald-950 dark:text-emerald-100 tracking-tight">
                SlothOS
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Do less. Let your sloth handle the rest.
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-emerald-950/30 p-1.5 rounded-2xl border border-slate-200/60 dark:border-emerald-900/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#16271e] text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-emerald-900/30'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <ModelBadge
            health={health}
            loading={healthLoading}
            onRefresh={onRefreshHealth}
            onOpenSettings={() => onViewChange('settings')}
          />

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-emerald-950/40 hover:bg-slate-200 dark:hover:bg-emerald-900/60 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto mt-2 pt-2 border-t border-slate-100 dark:border-emerald-950/40 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-emerald-950/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="bg-amber-500 text-white text-[9px] px-1 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
