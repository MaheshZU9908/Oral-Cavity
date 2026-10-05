import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Activity, ShieldCheck, Microscope, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left hero banner */}
      <div className="md:w-1/2 lg:w-5/12 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 p-8 sm:p-12 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Clinical AI Decision-Support</h1>
              <p className="text-xs text-teal-400 font-mono">MIL Nodal Metastasis Risk System</p>
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Multi-Instance Learning for High-Precision Histology Risk Stratification
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Designed for pathologists and oncology teams to evaluate sentinel lymph node biopsy sections using deep attention-based patch aggregation.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <Microscope className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Automated bag-level patch extraction and instance attention pooling</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Explicit isolated inference modes with deterministic safety checks</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <Database className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Supabase PostgreSQL persistence with strict doctor-level scoping</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 text-xs text-slate-500">
          Enterprise Clinical Edition v2.1.0 • For authorized medical personnel only.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
