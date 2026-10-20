import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Lock, HardDrive, WifiOff } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl p-3 sm:p-4 text-xs text-emerald-900 dark:text-emerald-200 transition-all">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-emerald-950 dark:text-emerald-100">
            Privacy Guarantee: Zero Telemetry, 100% Local Processing
          </span>
        </div>
        <button className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 flex items-center gap-1 font-medium">
          <span>{isOpen ? 'Hide details' : 'How it works'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/30 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100">No Account or Cloud Keys</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                SlothOS requires no account, credit card, or cloud API tokens. Your files never leave your machine.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100">Sandboxed Execution</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Files are strictly verified against path traversal. No system directories or external roots are ever touched.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100">Full Offline Operation</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Runs using your local Ollama runtime and built-in deterministic heuristic fallbacks without internet access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
