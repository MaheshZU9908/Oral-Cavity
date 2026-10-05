import { apiClient } from './apiClient';
import { ApiResponse, PaginatedResult } from '../types/api';
import { PredictionReportData } from '../types/prediction';

export const reportService = {
  async getReport(predictionId: string): Promise<PredictionReportData> {
    const res = await apiClient.get<ApiResponse<PredictionReportData>>(`/reports/${predictionId}`);
    return res.data.data;
  },

  async listReports(params: { riskCategory?: string; page?: number; limit?: number } = {}): Promise<PaginatedResult<any>> {
    const res = await apiClient.get<ApiResponse<PaginatedResult<any>>>('/reports', { params });
    return res.data.data;
  },
};
