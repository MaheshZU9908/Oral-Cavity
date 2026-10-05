export type Gender = 'Male' | 'Female' | 'Other';
export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH';

export interface LatestPredictionSummary {
  id: string;
  risk_category: RiskCategory;
  probability: number;
  created_at: string;
}

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
  latest_prediction?: LatestPredictionSummary | null;
}

export interface PatientFormData {
  fullName: string;
  age: number;
  gender: Gender;
  contact?: string;
  clinicalHistory?: string;
  diagnosis: string;
  biopsyInformation?: string;
}
