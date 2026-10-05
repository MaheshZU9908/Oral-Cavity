import { apiClient } from './apiClient';
import { ApiResponse, PaginatedResult } from '../types/api';
import { Patient, PatientFormData, Gender } from '../types/patient';

export interface PatientListParams {
  search?: string;
  gender?: Gender;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const patientService = {
  async listPatients(params: PatientListParams = {}): Promise<PaginatedResult<Patient>> {
    const res = await apiClient.get<ApiResponse<PaginatedResult<Patient>>>('/patients', {
      params,
    });
    return res.data.data;
  },

  async getPatient(id: string): Promise<Patient> {
    const res = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return res.data.data;
  },

  async createPatient(data: PatientFormData): Promise<Patient> {
    const res = await apiClient.post<ApiResponse<Patient>>('/patients', data);
    return res.data.data;
  },

  async updatePatient(id: string, data: Partial<PatientFormData>): Promise<Patient> {
    const res = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return res.data.data;
  },

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  },
};
