export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH';
export type InferenceMode = 'demo' | 'real';
export type ProcessingStatus = 'uploaded' | 'processing' | 'completed' | 'failed';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  specialization: string;
  qualification: string;
  hospital: string;
  phone?: string;
  professional_id?: string;
  avatar_url?: string;
  notification_preferences: {
    emailAlerts: boolean;
    highRiskAlerts: boolean;
    weeklyReport: boolean;
  };
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export type SafeDoctor = Omit<Doctor, 'password_hash'>;

export interface Patient {
  id: string;
  patient_id: string;
  doctor_id: string;
  full_name: string;
  age: number;
  gender: Gender;
  contact?: string;
  clinical_history?: string;
  diagnosis: string;
  biopsy_information?: string;
  date_added: string;
  created_at: string;
  updated_at: string;
  latest_prediction?: PredictionSummary | null;
}

export interface BiopsyImage {
  id: string;
  original_filename: string;
  filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  patient_id: string;
  doctor_id: string;
  created_at: string;
}

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
    dimensions?: { width: number; height: number };
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

export interface PredictionSummary {
  id: string;
  risk_category: RiskCategory;
  probability: number;
  created_at: string;
}

export interface PredictionReportData {
  currentPrediction: Prediction;
  patient: Patient;
  doctor: SafeDoctor;
  previousPrediction: PredictionSummary | null;
}

export interface DashboardSummary {
  totalPatients: number;
  totalPredictions: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
  };
  recentPatients: Patient[];
  recentPredictions: Prediction[];
  monthlyStats: {
    month: string;
    predictionsCount: number;
    highRiskCount: number;
  }[];
}
