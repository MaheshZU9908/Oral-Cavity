import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  User,
  Microscope,
  Layers,
  ShieldAlert,
  Clock,
  Award,
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { PredictionReportData } from '../types/prediction';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export const PredictionReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<PredictionReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getReport(id);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve clinical prediction report.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (isLoading) {
    return <LoadingState message="Generating clinical decision-support report..." className="h-96" />;
  }

  if (error || !reportData) {
    return (
      <ErrorState
        title="Report Not Found"
        message={error || 'The requested prediction report could not be loaded.'}
        onRetry={fetchReport}
      />
    );
  }

  const { currentPrediction: pred, patient, doctor, previousPrediction: prev } = reportData;
  const isReal = pred.inference_mode === 'real';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Clinical Report
          </Button>
        </div>
      </div>

      {/* Printable Clinical Report Document Container */}
      <div className="bg-white border border-slate-300 shadow-md rounded-xl p-8 sm:p-10 space-y-6 print-full text-slate-900">
        {/* Hospital & Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="text-lg font-black tracking-tight text-slate-950 uppercase">
              {doctor.hospital || 'Metropolitan University Medical Center'}
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              Department of Pathology & Molecular Oncology • Biopsy Diagnostics
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Attending Pathologist: <span className="font-semibold text-slate-900">{doctor.name}</span> ({doctor.qualification || 'MD'})
            </div>
          </div>

          <div className="sm:text-right">
            <div className="inline-block px-3 py-1 bg-slate-950 text-white font-mono text-xs font-bold rounded">
              REPORT REF: {pred.id.substring(0, 8).toUpperCase()}
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center sm:justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(pred.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Patient Clinical Demographics */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1.5 mb-3 border-b border-slate-200 flex items-center gap-1.5">
            <User className="w-4 h-4 text-teal-700" />
            1. Patient Information
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block font-semibold">Patient Name</span>
              <span className="font-bold text-slate-950 text-sm">{patient.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Patient ID (MRN)</span>
              <span className="font-mono font-bold text-teal-800 text-sm">{patient.patient_id}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Age / Sex</span>
              <span className="font-bold text-slate-950 text-sm">
                {patient.age} yrs • {patient.gender}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Enrolled Date</span>
              <span className="font-medium text-slate-900">
                {patient.date_added || new Date(patient.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs">
            <div className="font-semibold text-slate-700">Primary Diagnosis:</div>
            <div className="p-2 bg-slate-100 rounded font-semibold text-slate-900 mt-1">
              {patient.diagnosis}
            </div>
          </div>

          {patient.clinical_history && (
            <div className="mt-2 text-xs">
              <div className="font-semibold text-slate-700">Clinical Background:</div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{patient.clinical_history}</p>
            </div>
          )}
        </div>

        {/* Section 2: Biopsy Specimen & Slide Metadata */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1.5 mb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Microscope className="w-4 h-4 text-teal-700" />
            2. Biopsy Specimen Details
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block font-semibold">Specimen File</span>
              <span className="font-medium text-slate-900 truncate block" title={pred.image_metadata?.originalFilename}>
                {pred.image_metadata?.originalFilename || 'biopsy_slide_specimen.png'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Staining Protocol</span>
              <span className="font-medium text-slate-900">
                {pred.image_metadata?.staining || 'H&E Staining'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Magnification</span>
              <span className="font-medium text-slate-900">
                {pred.image_metadata?.magnification || '20x Objective'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">File Format</span>
              <span className="font-medium text-slate-900">
                {pred.image_metadata?.mimeType || 'image/png'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: AI Inference Finding & Risk Stratification */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1.5 mb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-teal-700" />
            3. Multi-Instance Learning AI Risk Prediction
          </h3>

          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              pred.risk_category === 'HIGH'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : pred.risk_category === 'MODERATE'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Nodal Metastasis Risk Stratification
              </div>
              <div className="text-2xl font-black mt-1">
                {pred.risk_category} RISK — {(pred.probability * 100).toFixed(1)}%
              </div>
              <div className="text-xs mt-1 font-medium">
                Finding: {pred.prediction_result}
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <RiskBadge category={pred.risk_category} probability={pred.probability} size="lg" />
              <div className="text-[11px] opacity-80 mt-1">
                Confidence: {(pred.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Multi-Instance Learning Bag Statistics */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1.5 mb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-700" />
            4. Patch Attention & Architecture Telemetry
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Total Patches</span>
              <span className="font-bold text-slate-900 text-sm">
                {pred.bag_statistics?.totalPatches || 128} patches
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">High-Attention Clusters</span>
              <span className="font-bold text-teal-700 text-sm">
                {pred.bag_statistics?.highAttentionPatches || 14} clusters
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Model & Version</span>
              <span className="font-mono font-semibold text-slate-900">
                {pred.model_name} ({pred.model_version})
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Inference Environment</span>
              <span className="font-bold uppercase text-slate-900">
                {isReal ? 'Real MIL Model' : 'Demo Simulation'}
              </span>
            </div>
          </div>

          {pred.clinical_notes && (
            <div className="mt-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Clinical Findings Suggestion:</span>
              <p className="text-slate-600 leading-relaxed">{pred.clinical_notes}</p>
            </div>
          )}
        </div>

        {/* Section 5: Historical Comparison */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1.5 mb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-700" />
            5. Longitudinal Historical Comparison
          </h3>

          {prev ? (
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block font-semibold">Previous Prediction</span>
                <div className="flex items-center gap-2 mt-1">
                  <RiskBadge category={prev.risk_category} size="sm" />
                  <span className="font-mono font-bold text-slate-900">
                    {(prev.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Recorded: {new Date(prev.created_at).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block font-semibold">Current Assessment</span>
                <div className="flex items-center gap-2 mt-1">
                  <RiskBadge category={pred.risk_category} size="sm" />
                  <span className="font-mono font-bold text-slate-900">
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Recorded: {new Date(pred.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic text-center">
              No previous prediction available.
            </div>
          )}
        </div>

        {/* Section 6: Prominent Mandatory Clinical Disclaimer */}
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950 leading-relaxed shadow-sm">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-900 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            Mandatory Clinical Decision-Support Disclaimer
          </div>
          <p className="font-medium">
            AI-assisted decision support only. This prediction is not a confirmed diagnosis and must not be used as a substitute for professional clinical judgment. All risk estimations must be verified by a board-certified pathologist with definitive immunohistochemistry (IHC) and morphological review.
          </p>
        </div>

        {/* Attending Signature Sign-off Block */}
        <div className="pt-8 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-600">
          <div>
            <div className="font-bold text-slate-900">{doctor.name}</div>
            <div>{doctor.qualification || 'MD, Pathologist'} • {doctor.specialization}</div>
            <div className="text-slate-500">{doctor.hospital}</div>
          </div>

          <div className="text-right">
            <div className="w-48 border-b border-slate-400 mb-1"></div>
            <div className="text-[11px] text-slate-500">Authorized Pathologist Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};
