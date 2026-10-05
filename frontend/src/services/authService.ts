import { apiClient } from './apiClient';
import { ApiResponse } from '../types/api';
import { AuthResponse, Doctor, LoginCredentials, RegisterData } from '../types/auth';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (res.data.data.token) {
      localStorage.setItem('clinical_ai_token', res.data.data.token);
    }
    return res.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (res.data.data.token) {
      localStorage.setItem('clinical_ai_token', res.data.data.token);
    }
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('clinical_ai_token');
    }
  },

  async getMe(): Promise<Doctor> {
    const res = await apiClient.get<ApiResponse<Doctor>>('/auth/me');
    return res.data.data;
  },
};
