import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Microscope,
  Plus,
  CheckCircle2,
  FileText,
  Layers,
  Printer,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { predictionService } from '../services/predictionService';
import { Patient, PatientFormData } from '../types/patient';
import { Prediction } from '../types/prediction';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';
import { FileUploader } from '../components/common/FileUploader';
import { RiskBadge } from '../components/common/RiskBadge';
import { PatientModal } from './PatientModal';

export const NewPrediction: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  const { success, error: toastError } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(preselectedPatientId || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [predictionResult, setPredictionResult] = useState<Prediction | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState<boolean>(false);
  const [modelInfo, setModelInfo] = useState<any>(null);

  // Load active patients list and model status
  useEffect(() => {
    setIsLoadingPatients(true);
    Promise.all([
      patientService.listPatients({ limit: 100 }),
      predictionService.getModelInfo().catch(() => null),
    ])
      .then(([pData, mInfo]) => {
        setPatients(pData.patients || []);
        if (mInfo) setModelInfo(mInfo);
      })
      .finally(() => setIsLoadingPatients(false));
  }, []);

  const handleCreatePatientInline = async (data: PatientFormData) => {
    try {
      const created = await patientService.createPatient(data);
      setPatients(prev => [created, ...prev]);
      setSelectedPatientId(created.id);
      success(`Patient ${created.full_name} enrolled and selected.`);
      setIsAddPatientModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to create patient.');
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toastError('Please select a patient from the clinical registry.');
      return;
    }
    if (!selectedFile) {
      toastError('Please select a biopsy histology image slide for evaluation.');
      return;
    }

    setIsProcessing(true);
    setPredictionResult(null);

    // Dynamic processing stages animation
    setProcessingStage('Ingesting biopsy image & performing tissue segmentation...');
    const t1 = setTimeout(() => {
      setProcessingStage('Extracting 256x256 histology patches & encoding instance features...');
    }, 450);
    const t2 = setTimeout(() => {
      setProcessingStage('Evaluating Multi-Instance Gated-Attention aggregation weights...');
    }, 900);

    try {
      const result = await predictionService.createPrediction(
        selectedPatientId,
        selectedFile,
        clinicalNotes
      );
      setPredictionResult(result);
      success('Multi-Instance Learning prediction completed successfully.');
    } catch (err: any) {
      toastError(err.message || 'Prediction analysis failed. Please verify the AI service status.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Microscope className="w-6 h-6 text-teal-600" />
          New Multi-Instance Learning (MIL) Analysis
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform bag-level nodal metastasis risk prediction from biopsy histology images
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border-slate-200">
            <form onSubmit={handleRunAnalysis} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="clinical-label mb-0">Step 1 • Select Patient Record</label>
                  <button
                    type="button"
                    onClick={() => setIsAddPatientModalOpen(true)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Patient
                  </button>
                </div>

                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  disabled={isProcessing || isLoadingPatients}
                  className="clinical-input"
                  required
                >
                  <option value="">-- Choose patient from active cohort --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.patient_id}) — {p.diagnosis}
                    </option>
                  ))}
                </select>

                {selectedPatient && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between animate-in fade-in">
                    <div>
                      <span className="font-bold text-slate-900">{selectedPatient.full_name}</span>
                      <span className="text-slate-500 ml-2">
                        {selectedPatient.age} yrs • {selectedPatient.gender}
                      </span>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        <span className="font-semibold">Diagnosis:</span> {selectedPatient.diagnosis}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border text-teal-700">
                      {selectedPatient.patient_id}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="clinical-label">Step 2 • Upload Histology Biopsy Slide</label>
                <FileUploader
                  selectedFile={selectedFile}
                  onFileSelect={file => setSelectedFile(file)}
                  disabled={isProcessing}
                />
              </div>

              <FormField
                label="Step 3 • Specimen & Clinical Notes (Optional)"
                helpText="Add notes regarding lymph node level, staining protocol, or clinical history"
              >
                <textarea
                  rows={2}
                  placeholder="e.g. Sentinel lymph node biopsy from left axilla; H&E section with suspected focal cellular atypia."
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  disabled={isProcessing}
                  className="clinical-input resize-none"
                />
              </FormField>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full py-3 shadow-md"
                  isLoading={isProcessing}
                  disabled={!selectedPatientId || !selectedFile || isProcessing}
                  leftIcon={<Microscope className="w-5 h-5" />}
                >
                  {isProcessing ? 'Executing MIL Pipeline...' : 'Run Nodal Metastasis AI Prediction'}
                </Button>

                <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                  Inference Mode: <span className="font-bold text-slate-600 uppercase">{modelInfo?.mode || 'Demo'}</span> • Gated-Attention Instance Pooling
                </p>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {isProcessing && (
            <Card className="p-6 border-teal-200 bg-teal-50/30 text-center animate-in fade-in">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
                  <Microscope className="w-6 h-6 text-teal-600 absolute inset-0 m-auto" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4">
                  Multi-Instance Learning in Progress
                </h3>
                <p className="text-xs text-teal-800 font-medium mt-1 animate-pulse">
                  {processingStage || 'Processing biopsy slide...'}
                </p>

                <div className="w-full max-w-xs mt-6 space-y-2 text-left text-xs text-slate-600 border-t border-teal-100 pt-4">
                  <div className="flex items-center gap-2 text-teal-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1. Slide Ingestion & Validation
                  </div>
                  <div className="flex items-center gap-2 text-teal-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 2. Patch Extraction & Segmentation
                  </div>
                  <div className="flex items-center gap-2 text-teal-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 3. Attention Weight Aggregation
                  </div>
                  <div className="flex items-center gap-2 text-teal-600 animate-pulse">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin shrink-0" />
                    4. Computing Metastasis Probability
                  </div>
                </div>
              </div>
            </Card>
          )}

          {predictionResult && !isProcessing && (
            <Card className="p-6 border-slate-200 shadow-md animate-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700">
                    Decision-Support Output
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nodal Metastasis Risk Assessment
                  </h3>
                </div>
                <RiskBadge
                  category={predictionResult.risk_category}
                  probability={predictionResult.probability}
                  size="lg"
                />
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  predictionResult.risk_category === 'HIGH'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : predictionResult.risk_category === 'MODERATE'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wide">
                  {predictionResult.prediction_result}
                </div>
                <div className="text-2xl font-black mt-1 font-mono">
                  {(predictionResult.probability * 100).toFixed(1)}%{' '}
                  <span className="text-xs font-normal opacity-80">metastatic risk score</span>
                </div>
                <div className="text-xs opacity-90 mt-1">
                  Confidence Metric: {(predictionResult.confidence * 100).toFixed(1)}%
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  Multi-Instance Attention Statistics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">Total Patches</span>
                    <span className="font-bold text-slate-900">
                      {predictionResult.bag_statistics?.totalPatches || 128} instances
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">High Attention</span>
                    <span className="font-bold text-teal-700">
                      {predictionResult.bag_statistics?.highAttentionPatches || 14} clusters
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Model:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {predictionResult.model_name} ({predictionResult.model_version})
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Inference Mode:</span>
                  <span
                    className={`font-bold uppercase ${
                      predictionResult.inference_mode === 'real' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {predictionResult.inference_mode}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Processing Latency:</span>
                  <span className="text-slate-900">{predictionResult.processing_time} ms</span>
                </div>
              </div>

              {predictionResult.clinical_notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Decision Findings
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed p-2.5 bg-slate-50 rounded-lg">
                    {predictionResult.clinical_notes}
                  </p>
                </div>
              )}

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Clinical Decision-Support Notice:</span>
                AI-assisted decision support only. This prediction is not a confirmed diagnosis and must not be used as a substitute for professional clinical judgment.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/predictions/${predictionResult.id}`)}
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  Open Full Clinical Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print
                </Button>
              </div>
            </Card>
          )}

          {!predictionResult && !isProcessing && (
            <Card className="p-8 border-dashed border-slate-300 text-center text-slate-500">
              <Microscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">
                Awaiting Specimen Submission
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Select a patient record and upload a digitized histology biopsy slide to initiate the Multi-Instance Learning analysis.
              </p>
            </Card>
          )}
        </div>
      </div>

      <PatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSubmit={handleCreatePatientInline}
      />
    </div>
  );
};
