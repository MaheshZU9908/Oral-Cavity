import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Microscope,
  AlertOctagon,
  ShieldCheck,
  ArrowRight,
  Plus,
  Activity,
  Clock,
  Sparkles,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardSummary } from '../types/dashboard';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export const Dashboard: React.FC = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading live clinical KPIs and risk distribution..." className="h-96" />;
  }

  if (error || !summary) {
    return (
      <ErrorState
        title="Dashboard Data Unavailable"
        message={error || 'Failed to retrieve clinical metrics from the server.'}
        onRetry={fetchDashboard}
      />
    );
  }

  const totalPreds = summary.totalPredictions || 0;
  const highRiskPercent = totalPreds > 0 ? Math.round((summary.highRiskCount / totalPreds) * 100) : 0;
  const modRiskPercent = totalPreds > 0 ? Math.round((summary.moderateRiskCount / totalPreds) * 100) : 0;
  const lowRiskPercent = totalPreds > 0 ? Math.round((summary.lowRiskCount / totalPreds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-teal-950 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Decision-Support Active
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Welcome back, {doctor?.name || 'Doctor'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {doctor?.hospital || 'Clinical Oncology Center'} • Multi-Instance Learning Nodal Metastasis Risk Stratification Pipeline
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold shadow-lg"
            onClick={() => navigate('/predictions/new')}
            leftIcon={<Microscope className="w-4 h-4" />}
          >
            New MIL Analysis
          </Button>
          <Button
            variant="outline"
            size="md"
            className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800"
            onClick={() => navigate('/patients')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Patient
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Patients
            </span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary.totalPatients}
            </span>
            <span className="text-xs text-slate-500">enrolled</span>
          </div>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Biopsy Analyses
            </span>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Microscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary.totalPredictions}
            </span>
            <span className="text-xs text-teal-700 font-medium">MIL slides</span>
          </div>
        </Card>

        <Card className="p-5 border-rose-200 bg-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              High Risk Findings
            </span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-900">
              {summary.highRiskCount}
            </span>
            <span className="text-xs text-rose-700 font-semibold font-mono">
              ({highRiskPercent}%)
            </span>
          </div>
        </Card>

        <Card className="p-5 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Low / Moderate Risk
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
              {summary.lowRiskCount + summary.moderateRiskCount}
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              ({100 - highRiskPercent}%)
            </span>
          </div>
        </Card>
      </div>

      {/* Risk Distribution Breakdown */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Nodal Metastasis Risk Stratification Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live aggregation of all Multi-Instance Learning predictions across patient cohort
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Low ({summary.lowRiskCount})
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Mod ({summary.moderateRiskCount})
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              High ({summary.highRiskCount})
            </span>
          </div>
        </div>

        {totalPreds > 0 ? (
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${lowRiskPercent}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Low Risk: ${summary.lowRiskCount} (${lowRiskPercent}%)`}
            />
            <div
              style={{ width: `${modRiskPercent}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Moderate Risk: ${summary.moderateRiskCount} (${modRiskPercent}%)`}
            />
            <div
              style={{ width: `${highRiskPercent}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`High Risk: ${summary.highRiskCount} (${highRiskPercent}%)`}
            />
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
            No biopsy predictions recorded yet. Run your first MIL analysis to populate risk telemetry.
          </div>
        )}
      </Card>

      {/* Two Column Section: Recent Patients and Recent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
            </div>
            <Link
              to="/patients"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {summary.recentPatients.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No patients registered yet. Click 'Add Patient' to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.recentPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{patient.full_name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {patient.patient_id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {patient.age} yrs • {patient.gender} • {patient.diagnosis}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent MIL Predictions</h3>
            </div>
            <Link
              to="/predictions"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Full Log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {summary.recentPredictions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No predictions generated yet. Upload a biopsy slide to run inference.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.recentPredictions.map(pred => (
                <div
                  key={pred.id}
                  onClick={() => navigate(`/predictions/${pred.id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {pred.patient?.full_name || 'Patient'} ({pred.patient?.patient_id})
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(pred.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{pred.model_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <RiskBadge category={pred.risk_category} probability={pred.probability} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
