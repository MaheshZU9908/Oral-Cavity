import { Patient, RiskCategory } from './patient';
import { Doctor } from './auth';

export type InferenceMode = 'demo' | 'real';
export type ProcessingStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface BagStatistics {
  totalPatches: number;
  highAttentionPatches: number;
  topFeatureScore: number;
  aggregationType: string;
  patchDistribution?: {
    lowRiskPatches: number;
    moderateRiskPatches: number;
    highRiskPatches: number;
  };
}

export interface Prediction {
  id: string;
  patient_id: string;
  doctor_id: string;
  image_id?: string | null;
  image_metadata?: {
    originalFilename?: string;
    filename?: string;
    fileSize?: number;
    mimeType?: string;
    magnification?: string;
    staining?: string;
  };
  prediction_result: string;
  risk_category: RiskCategory;
  probability: number;
  confidence: number;
  model_name: string;
  model_version: string;
  inference_mode: InferenceMode;
  processing_status: ProcessingStatus;
  processing_time: number;
  clinical_notes?: string;
  bag_statistics: BagStatistics;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface PredictionReportData {
  currentPrediction: Prediction;
  patient: Patient;
  doctor: Doctor;
  previousPrediction: {
    id: string;
    risk_category: RiskCategory;
    probability: number;
    created_at: string;
  } | null;
}
