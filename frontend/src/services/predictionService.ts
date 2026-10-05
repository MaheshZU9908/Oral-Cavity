import { apiClient } from './apiClient';
import { ApiResponse, PaginatedResult } from '../types/api';
import { Prediction } from '../types/prediction';
import { RiskCategory } from '../types/patient';

export interface PredictionListParams {
  patientId?: string;
  riskCategory?: RiskCategory;
  inferenceMode?: 'demo' | 'real';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const predictionService = {
  async createPrediction(patientId: string, imageFile: File, clinicalNotes?: string): Promise<Prediction> {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('image', imageFile);
    if (clinicalNotes) {
      formData.append('clinicalNotes', clinicalNotes);
    }

    const res = await apiClient.post<ApiResponse<Prediction>>('/predictions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async listPredictions(params: PredictionListParams = {}): Promise<PaginatedResult<Prediction>> {
    const res = await apiClient.get<ApiResponse<PaginatedResult<Prediction>>>('/predictions', {
      params,
    });
    return res.data.data;
  },

  async getPrediction(id: string): Promise<Prediction> {
    const res = await apiClient.get<ApiResponse<Prediction>>(`/predictions/${id}`);
    return res.data.data;
  },

  async getPatientHistory(patientId: string): Promise<Prediction[]> {
    const res = await apiClient.get<ApiResponse<Prediction[]>>(`/predictions/patient/${patientId}`);
    return res.data.data;
  },

  async getModelInfo(): Promise<any> {
    const res = await apiClient.get<ApiResponse<any>>('/predictions/model-info');
    return res.data.data;
  },
};
