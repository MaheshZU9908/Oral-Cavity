import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Cpu, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { profileService } from '../services/profileService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const Settings: React.FC = () => {
  const { doctor, updateDoctorState } = useAuth();
  const { success, error: toastError } = useToast();

  const [emailAlerts, setEmailAlerts] = useState<boolean>(
    doctor?.notification_preferences?.emailAlerts ?? true
  );
  const [highRiskAlerts, setHighRiskAlerts] = useState<boolean>(
    doctor?.notification_preferences?.highRiskAlerts ?? true
  );
  const [weeklyReport, setWeeklyReport] = useState<boolean>(
    doctor?.notification_preferences?.weeklyReport ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const updated = await profileService.updateProfile({
        notification_preferences: {
          emailAlerts,
          highRiskAlerts,
          weeklyReport,
        },
      } as any);
      updateDoctorState(updated);
      success('Notification and system preferences saved to database.');
    } catch (err: any) {
      toastError(err.message || 'Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-teal-600" />
          Clinical System Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure notification alerts, AI runtime settings, and database synchronization
        </p>
      </div>

      {/* Notification Preferences (Connected to Backend Persistence) */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Clinical Notification Preferences
          </h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100/70 transition">
            <input
              type="checkbox"
              checked={highRiskAlerts}
              onChange={e => setHighRiskAlerts(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                High-Risk Metastasis Immediate Notification
              </span>
              <span className="text-[11px] text-slate-500">
                Trigger high-priority alerts whenever an MIL prediction yields High Nodal Metastasis risk.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100/70 transition">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Hospital Email Status Updates
              </span>
              <span className="text-[11px] text-slate-500">
                Receive email dispatches for completed histology slide batch analyses.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100/70 transition">
            <input
              type="checkbox"
              checked={weeklyReport}
              onChange={e => setWeeklyReport(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Weekly Oncology Digest & Risk Cohort Summary
              </span>
              <span className="text-[11px] text-slate-500">
                Receive weekly statistical breakdown of predictions across your enrolled patients.
              </span>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSavePreferences}
            isLoading={isSaving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* AI Inference Architecture Telemetry */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            AI Multi-Instance Learning Pipeline Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block font-semibold">Aggregation Architecture</span>
            <span className="text-slate-900 font-bold mt-0.5 block">
              Gated-Attention Multiple Instance Learning (CLAM-SB)
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block font-semibold">Instance Resolution</span>
            <span className="text-slate-900 font-bold mt-0.5 block">
              256 x 256 patches @ 20x magnification (0.5µm/px)
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block font-semibold">Persistence Engine</span>
            <span className="text-slate-900 font-bold mt-0.5 block">
              Supabase PostgreSQL Database
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block font-semibold">Decision Boundaries</span>
            <span className="text-slate-900 font-mono mt-0.5 block">
              Low: &lt;35% • Mod: 35-70% • High: &gt;70%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
