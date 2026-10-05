import { v4 as uuidv4 } from 'uuid';
import { getScopedSupabaseClient } from '../config/supabase';
import { ApiError } from '../utils/apiError';
import { Patient, Gender } from '../types';

export class PatientService {
  private generatePatientId(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PT-${randomNum}`;
  }

  async listPatients(
    doctorId: string,
    params: {
      search?: string;
      gender?: Gender;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<{ patients: Patient[]; total: number; page: number; limit: number; totalPages: number }> {
    const supabase = getScopedSupabaseClient(doctorId);
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('doctor_id', doctorId);

    if (params.gender) {
      query = query.eq('gender', params.gender);
    }

    if (params.search && params.search.trim() !== '') {
      const s = `%${params.search.trim()}%`;
      query = query.or(`full_name.ilike.${s},patient_id.ilike.${s},diagnosis.ilike.${s}`);
    }

    const sortColumn = params.sortBy || 'created_at';
    const isAscending = params.sortOrder === 'asc';
    query = query.order(sortColumn, { ascending: isAscending }).range(offset, offset + limit - 1);

    const { data: patients, count, error } = await query;

    if (error) {
      throw ApiError.databaseError(`Failed to fetch patients list: ${error.message}`);
    }

    const patientList = patients || [];

    // Attach latest prediction summary for each patient
    if (patientList.length > 0) {
      const patientIds = patientList.map((p: any) => p.id);
      const { data: predictions } = await supabase
        .from('predictions')
        .select('id, patient_id, risk_category, probability, created_at')
        .in('patient_id', patientIds)
        .order('created_at', { ascending: false });

      if (predictions) {
        const latestPredMap = new Map<string, any>();
        for (const pred of predictions) {
          if (!latestPredMap.has(pred.patient_id)) {
            latestPredMap.set(pred.patient_id, {
              id: pred.id,
              risk_category: pred.risk_category,
              probability: Number(pred.probability),
              created_at: pred.created_at,
            });
          }
        }

        patientList.forEach((p: any) => {
          p.latest_prediction = latestPredMap.get(p.id) || null;
        });
      }
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      patients: patientList as Patient[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getPatientById(doctorId: string, id: string): Promise<Patient> {
    const supabase = getScopedSupabaseClient(doctorId);
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('doctor_id', doctorId)
      .maybeSingle();

    if (error) {
      throw ApiError.databaseError(`Error retrieving patient: ${error.message}`);
    }

    if (!patient) {
      throw ApiError.notFound('Patient record not found or access unauthorized.');
    }

    // Fetch latest prediction
    const { data: latestPred } = await supabase
      .from('predictions')
      .select('id, risk_category, probability, created_at')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPred) {
      patient.latest_prediction = {
        id: latestPred.id,
        risk_category: latestPred.risk_category,
        probability: Number(latestPred.probability),
        created_at: latestPred.created_at,
      };
    }

    return patient as Patient;
  }

  async createPatient(
    doctorId: string,
    data: {
      fullName: string;
      age: number;
      gender: Gender;
      contact?: string;
      clinicalHistory?: string;
      diagnosis: string;
      biopsyInformation?: string;
    }
  ): Promise<Patient> {
    const supabase = getScopedSupabaseClient(doctorId);
    const newPatient = {
      id: uuidv4(),
      patient_id: this.generatePatientId(),
      doctor_id: doctorId,
      full_name: data.fullName.trim(),
      age: data.age,
      gender: data.gender,
      contact: data.contact || '',
      clinical_history: data.clinicalHistory || '',
      diagnosis: data.diagnosis.trim(),
      biopsy_information: data.biopsyInformation || '',
      date_added: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('patients')
      .insert(newPatient)
      .select('*')
      .single();

    if (error || !created) {
      throw ApiError.databaseError(`Failed to create patient: ${error?.message || 'Insert failed'}`);
    }

    return created as Patient;
  }

  async updatePatient(
    doctorId: string,
    id: string,
    data: {
      fullName?: string;
      age?: number;
      gender?: Gender;
      contact?: string;
      clinicalHistory?: string;
      diagnosis?: string;
      biopsyInformation?: string;
    }
  ): Promise<Patient> {
    const supabase = getScopedSupabaseClient(doctorId);

    // Verify ownership
    await this.getPatientById(doctorId, id);

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (data.fullName !== undefined) updatePayload.full_name = data.fullName.trim();
    if (data.age !== undefined) updatePayload.age = data.age;
    if (data.gender !== undefined) updatePayload.gender = data.gender;
    if (data.contact !== undefined) updatePayload.contact = data.contact;
    if (data.clinicalHistory !== undefined) updatePayload.clinical_history = data.clinicalHistory;
    if (data.diagnosis !== undefined) updatePayload.diagnosis = data.diagnosis.trim();
    if (data.biopsyInformation !== undefined) updatePayload.biopsy_information = data.biopsyInformation;

    const { data: updated, error } = await supabase
      .from('patients')
      .update(updatePayload)
      .eq('id', id)
      .eq('doctor_id', doctorId)
      .select('*')
      .single();

    if (error || !updated) {
      throw ApiError.databaseError(`Failed to update patient: ${error?.message || 'Update failed'}`);
    }

    return updated as Patient;
  }

  async deletePatient(doctorId: string, id: string): Promise<void> {
    const supabase = getScopedSupabaseClient(doctorId);

    // Verify ownership
    await this.getPatientById(doctorId, id);

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)
      .eq('doctor_id', doctorId);

    if (error) {
      throw ApiError.databaseError(`Failed to delete patient: ${error.message}`);
    }
  }
}

export const patientService = new PatientService();
