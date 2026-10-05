import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Microscope,
  History,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    info('You have been signed out.');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Patients', path: '/patients', icon: <Users className="w-4 h-4" /> },
    { label: 'New Prediction', path: '/predictions/new', icon: <Microscope className="w-4 h-4" />, highlight: true },
    { label: 'Prediction History', path: '/predictions', icon: <History className="w-4 h-4" /> },
    { label: 'Reports', path: '/reports', icon: <FileText className="w-4 h-4" /> },
    { label: 'Doctor Profile', path: '/profile', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-black text-sm">
              M
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">MIL Histology AI</div>
              <div className="text-[10px] text-teal-400 font-mono tracking-tight">CLINICAL SUITE</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Decision Support
          </div>

          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-800 text-white font-semibold shadow-sm'
                    : item.highlight
                    ? 'text-teal-400 hover:bg-teal-950/50 hover:text-teal-300'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              )}
            </NavLink>
          ))}
        </div>

        {/* Clinical Disclaimer Footnote in Sidebar */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1 text-[10px] uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            Decision Support
          </div>
          Not a standalone diagnosis. Always correlate with IHC and histology review.
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
