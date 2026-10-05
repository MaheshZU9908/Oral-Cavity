import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Filter, ExternalLink } from 'lucide-react';
import { reportService } from '../services/reportService';
import { Card } from '../components/common/Card';
import { RiskBadge } from '../components/common/RiskBadge';
import { Pagination } from '../components/common/Pagination';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [riskFilter, setRiskFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.listReports({
        page,
        limit: 10,
        riskCategory: riskFilter || undefined,
      });
      setReports(data.reports || []);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve clinical reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, riskFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Clinical Decision-Support Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Archived diagnostic decision reports ready for print and clinical review
          </p>
        </div>
      </div>

      <Card className="p-4 border-slate-200 flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-700">Filter by Risk:</span>
        <select
          value={riskFilter}
          onChange={e => {
            setRiskFilter(e.target.value);
            setPage(1);
          }}
          className="clinical-input w-40 text-xs py-1.5"
        >
          <option value="">All Categories</option>
          <option value="HIGH">High Risk</option>
          <option value="MODERATE">Moderate Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
      </Card>

      <Card className="p-0 border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <LoadingState message="Loading archived clinical reports..." className="h-72" />
        ) : error ? (
          <div className="p-6">
            <ErrorState title="Error Loading Reports" message={error} onRetry={fetchReports} />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Reports Found"
              description="No prediction reports match your active filter."
              actionText="Generate Prediction"
              onAction={() => navigate('/predictions/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Report Ref</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Diagnosis</th>
                  <th className="py-3.5 px-4">Report Date</th>
                  <th className="py-3.5 px-4">Risk Category</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      REF-{r.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {r.patient?.full_name} ({r.patient?.patient_id})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {r.patient?.diagnosis}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge category={r.risk_category} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {(r.probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/predictions/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        Open Report <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && reports.length > 0 && (
          <div className="px-5 pb-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={10}
              onPageChange={newPage => setPage(newPage)}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
