import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Microscope,
  Edit2,
  FileText,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { predictionService } from '../services/predictionService';
import { Patient, PatientFormData } from '../types/patient';
import { Prediction } from '../types/prediction';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { PatientModal } from './PatientModal';

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatientData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const p = await patientService.getPatient(id);
      setPatient(p);
      const preds = await predictionService.getPatientHistory(id);
      setPredictions(preds || []);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve patient details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const handleUpdatePatient = async (data: PatientFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const updated = await patientService.updatePatient(id, data);
      setPatient(updated);
      success('Patient details updated successfully.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to update patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading patient chart and prediction history..." className="h-96" />;
  }

  if (error || !patient) {
    return (
      <ErrorState
        title="Patient Record Not Found"
        message={error || 'The requested patient record could not be loaded.'}
        onRetry={fetchPatientData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patients')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Registry
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              {patient.full_name}
              <span className="text-xs font-mono font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">
                {patient.patient_id}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Enrolled on {patient.date_added || new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Chart
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/predictions/new?patientId=${patient.id}`)}
            leftIcon={<Microscope className="w-4 h-4" />}
          >
            New MIL Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              Clinical Summary & Demographics
            </h3>
            {patient.latest_prediction && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Latest Risk:</span>
                <RiskBadge
                  category={patient.latest_prediction.risk_category}
                  probability={patient.latest_prediction.probability}
                  size="sm"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 font-semibold block mb-1">Age / Gender</span>
              <span className="text-slate-900 font-bold text-sm">
                {patient.age} yrs • {patient.gender}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 font-semibold block mb-1">Contact / MRN</span>
              <span className="text-slate-900 font-medium">
                {patient.contact || 'None on record'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg col-span-2 sm:col-span-1">
              <span className="text-slate-500 font-semibold block mb-1">Total Biopsies</span>
              <span className="text-teal-700 font-bold text-sm">
                {predictions.length} analyses
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Primary Diagnosis
            </h4>
            <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-lg text-xs font-semibold text-teal-950">
              {patient.diagnosis}
            </div>
          </div>

          {patient.clinical_history && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical & Surgical History
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-lg">
                {patient.clinical_history}
              </p>
            </div>
          )}

          {patient.biopsy_information && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Biopsy Specimen Context
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-lg">
                {patient.biopsy_information}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Microscope className="w-4 h-4 text-teal-600" />
              Biopsy Workflow
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload digitized H&E whole-slide or core biopsy images to evaluate nodal metastasis risk with deep Multi-Instance Learning (MIL).
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate(`/predictions/new?patientId=${patient.id}`)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Start New Analysis
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Biopsy Prediction History ({predictions.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of AI decision-support inferences for this patient
            </p>
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No MIL predictions have been recorded yet for this patient.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Prediction Date</th>
                  <th className="py-3 px-4">Model & Version</th>
                  <th className="py-3 px-4">Inference Mode</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4">Patches Evaluated</th>
                  <th className="py-3 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {predictions.map(pred => (
                  <tr key={pred.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                      {new Date(pred.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {pred.model_name} ({pred.model_version})
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      <RiskBadge category={pred.risk_category} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {Math.round(pred.probability * 100)}%
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {pred.bag_statistics?.totalPatches || 128} patches (
                      {pred.bag_statistics?.highAttentionPatches || 0} high-attention)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/predictions/${pred.id}`}
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
      </Card>

      <PatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdatePatient}
        patientToEdit={patient}
        isLoading={isSubmitting}
      />
    </div>
  );
};
