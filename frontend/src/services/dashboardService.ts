import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return res.data.data;
  },
};
