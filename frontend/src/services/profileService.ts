import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { Doctor } from '../types/auth';

export const profileService = {
  async getProfile(): Promise<Doctor> {
    const res = await apiClient.get<ApiResponse<Doctor>>('/profile');
    return res.data.data;
  },

  async updateProfile(data: Partial<Doctor>): Promise<Doctor> {
    const res = await apiClient.put<ApiResponse<Doctor>>('/profile', data);
    return res.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put('/profile/change-password', data);
  },
};
