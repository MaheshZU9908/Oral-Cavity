import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Filter,
  ExternalLink,
  Microscope,
} from 'lucide-react';
import { predictionService, PredictionListParams } from '../services/predictionService';
import { Prediction } from '../types/prediction';
import { RiskCategory } from '../types/patient';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { Pagination } from '../components/common/Pagination';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const PredictionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [riskFilter, setRiskFilter] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: PredictionListParams = {
        page,
        limit,
        riskCategory: (riskFilter as RiskCategory) || undefined,
        inferenceMode: (modeFilter as any) || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
      const data = await predictionService.listPredictions(params);
      setPredictions(data.predictions || []);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve prediction history.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, riskFilter, modeFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600" />
            Prediction Telemetry & Histology Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail of Multi-Instance Learning nodal metastasis assessments
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/predictions/new')}
          leftIcon={<Microscope className="w-4 h-4" />}
        >
          New MIL Analysis
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Filter Risk:</span>
            <select
              value={riskFilter}
              onChange={e => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="clinical-input w-36 text-xs py-1.5"
            >
              <option value="">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Mode:</span>
            <select
              value={modeFilter}
              onChange={e => {
                setModeFilter(e.target.value);
                setPage(1);
              }}
              className="clinical-input w-36 text-xs py-1.5"
            >
              <option value="">All Modes</option>
              <option value="real">Real Model</option>
              <option value="demo">Demo Simulation</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-0 border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <LoadingState message="Loading prediction audit trail..." className="h-72" />
        ) : error ? (
          <div className="p-6">
            <ErrorState title="History Load Error" message={error} onRetry={fetchHistory} />
          </div>
        ) : predictions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Predictions Found"
              description="No prediction records matched your active filter selections."
              actionText="Run First Analysis"
              onAction={() => navigate('/predictions/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Risk Category</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Model / Version</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {predictions.map(pred => (
                  <tr key={pred.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                      {pred.patient?.patient_id || 'PT-UNKNOWN'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {pred.patient?.full_name || 'Patient'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {new Date(pred.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RiskBadge category={pred.risk_category} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {(pred.probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {pred.model_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          pred.inference_mode === 'real'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {pred.inference_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/predictions/${pred.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        View Report <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && predictions.length > 0 && (
          <div className="px-5 pb-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={newPage => setPage(newPage)}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
