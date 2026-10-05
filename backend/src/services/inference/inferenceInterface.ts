import { RiskCategory, InferenceMode, BagStatistics } from '../../types';

export interface ModelInferenceResult {
  predictionResult: string; // e.g. "Positive for Nodal Metastasis"
  riskCategory: RiskCategory;
  probability: number;
  confidence: number;
  modelName: string;
  modelVersion: string;
  inferenceMode: InferenceMode;
  processingTimeMs: number;
  bagStatistics: BagStatistics;
  clinicalNotesSuggestion?: string;
}

export interface ModelInfo {
  name: string;
  version: string;
  architecture: string;
  aggregationMethod: string;
  supportedModalities: string[];
  mode: InferenceMode;
  status: 'ready' | 'offline' | 'simulated';
}

export interface IInferenceService {
  predict(
    imagePath: string,
    metadata?: {
      patientId: string;
      clinicalDiagnosis?: string;
      originalFilename?: string;
    }
  ): Promise<ModelInferenceResult>;

  getModelInfo(): Promise<ModelInfo>;

  healthCheck(): Promise<{
    healthy: boolean;
    mode: InferenceMode;
    serviceUrl?: string;
    message: string;
  }>;
}
