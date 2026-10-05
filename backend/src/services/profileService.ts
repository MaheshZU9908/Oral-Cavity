import bcrypt from 'bcryptjs';
import { getScopedSupabaseClient } from '../config/supabase';
import { ApiError } from '../utils/apiError';
import { SafeDoctor } from '../types';

export class ProfileService {
  async getProfile(doctorId: string): Promise<SafeDoctor> {
    const supabase = getScopedSupabaseClient(doctorId);
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('id, name, email, specialization, qualification, hospital, phone, professional_id, avatar_url, notification_preferences, last_login_at, created_at, updated_at')
      .eq('id', doctorId)
      .single();

    if (error || !doctor) {
      throw ApiError.notFound('Doctor profile not found.');
    }

    return doctor as SafeDoctor;
  }

  async updateProfile(
    doctorId: string,
    data: {
      name?: string;
      specialization?: string;
      qualification?: string;
      hospital?: string;
      phone?: string;
      professionalId?: string;
      avatarUrl?: string;
      notificationPreferences?: any;
    }
  ): Promise<SafeDoctor> {
    const supabase = getScopedSupabaseClient(doctorId);
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.specialization !== undefined) updatePayload.specialization = data.specialization.trim();
    if (data.qualification !== undefined) updatePayload.qualification = data.qualification.trim();
    if (data.hospital !== undefined) updatePayload.hospital = data.hospital.trim();
    if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
    if (data.professionalId !== undefined) updatePayload.professional_id = data.professionalId.trim();
    if (data.avatarUrl !== undefined) updatePayload.avatar_url = data.avatarUrl;
    if (data.notificationPreferences !== undefined) {
      updatePayload.notification_preferences = data.notificationPreferences;
    }

    const { data: updated, error } = await supabase
      .from('doctors')
      .update(updatePayload)
      .eq('id', doctorId)
      .select('id, name, email, specialization, qualification, hospital, phone, professional_id, avatar_url, notification_preferences, last_login_at, created_at, updated_at')
      .single();

    if (error || !updated) {
      throw ApiError.databaseError(`Failed to update profile: ${error?.message || 'Update failed'}`);
    }

    return updated as SafeDoctor;
  }

  async changePassword(
    doctorId: string,
    data: {
      currentPassword: string;
      newPassword: string;
    }
  ): Promise<void> {
    const supabase = getScopedSupabaseClient(doctorId);
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('id, password_hash')
      .eq('id', doctorId)
      .single();

    if (error || !doctor) {
      throw ApiError.notFound('Doctor account not found.');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, doctor.password_hash);
    if (!isMatch) {
      throw ApiError.badRequest('Current password provided is incorrect.', 'INVALID_PASSWORD');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(data.newPassword, salt);

    const { error: updateErr } = await supabase
      .from('doctors')
      .update({
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', doctorId);

    if (updateErr) {
      throw ApiError.databaseError(`Failed to change password: ${updateErr.message}`);
    }
  }
}

export const profileService = new ProfileService();
