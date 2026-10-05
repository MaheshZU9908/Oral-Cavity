import React, { useEffect, useState } from 'react';
import { Menu, Activity, Bell, User, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { predictionService } from '../services/predictionService';

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { doctor } = useAuth();
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    predictionService
      .getModelInfo()
      .then(info => setModelInfo(info))
      .catch(() => {});
  }, []);

  const isRealMode = modelInfo?.mode === 'real';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200/90 shadow-sm">
      {/* Left side: Hamburger on mobile + system identifier */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 hover:text-slate-800 transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600 text-white shadow-sm font-bold text-sm">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-900">
                NodalMetastasis<span className="text-teal-600 font-extrabold">.MIL</span>
              </span>
              {/* AI Mode Pill Badge */}
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                  isRealMode
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title={
                  isRealMode
                    ? 'Connected to real Multi-Instance Learning model inference service'
                    : 'Running in simulated DEMO mode. No real medical inference is performed.'
                }
              >
                <Cpu className="w-2.5 h-2.5" />
                {isRealMode ? 'Real Model Active' : 'Demo Inference Mode'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Clinical Decision-Support for Biopsy Histology
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Hospital, notifications, and doctor profile pill */}
      <div className="flex items-center gap-3 sm:gap-4">
        {doctor?.hospital && (
          <div className="hidden xl:block text-right">
            <div className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
              {doctor.hospital}
            </div>
            <div className="text-[10px] text-slate-500">Pathology & Oncology Div.</div>
          </div>
        )}

        <button
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition relative"
          aria-label="Clinical notifications"
          title="Clinical Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Doctor Identity */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs shadow-inner">
            {doctor?.name
              ? doctor.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {doctor?.name || 'Dr. Physician'}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {doctor?.qualification || doctor?.specialization || 'Attending Pathologist'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
