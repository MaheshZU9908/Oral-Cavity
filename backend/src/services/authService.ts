import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient } from '../config/supabase';
import { generateToken } from '../utils/token';
import { ApiError } from '../utils/apiError';
import { SafeDoctor, Doctor } from '../types';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    specialization?: string;
    qualification?: string;
    hospital?: string;
    phone?: string;
    professionalId?: string;
  }): Promise<{ doctor: SafeDoctor; token: string }> {
    const supabase = getSupabaseClient();
    const emailLower = data.email.toLowerCase().trim();

    // Check if email already exists
    const { data: existing, error: checkErr } = await supabase
      .from('doctors')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (checkErr && !checkErr.message.includes('relation "doctors" does not exist')) {
      throw ApiError.databaseError(`Database query error: ${checkErr.message}`);
    }

    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newDoctor = {
      id: uuidv4(),
      name: data.name.trim(),
      email: emailLower,
      password_hash: passwordHash,
      specialization: data.specialization || 'Histopathology / Oncology',
      qualification: data.qualification || 'MD, Pathologist',
      hospital: data.hospital || 'Metropolitan Medical Center',
      phone: data.phone || '',
      professional_id: data.professionalId || '',
      avatar_url: '',
      notification_preferences: {
        emailAlerts: true,
        highRiskAlerts: true,
        weeklyReport: true,
      },
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('doctors')
      .insert(newDoctor)
      .select('id, name, email, specialization, qualification, hospital, phone, professional_id, avatar_url, notification_preferences, last_login_at, created_at, updated_at')
      .single();

    if (insertErr || !inserted) {
      throw ApiError.databaseError(`Failed to create doctor account: ${insertErr?.message || 'Database insert failed'}`);
    }

    const safeDoctor: SafeDoctor = {
      id: inserted.id,
      name: inserted.name,
      email: inserted.email,
      specialization: inserted.specialization,
      qualification: inserted.qualification,
      hospital: inserted.hospital,
      phone: inserted.phone,
      professional_id: inserted.professional_id,
      avatar_url: inserted.avatar_url,
      notification_preferences: inserted.notification_preferences,
      last_login_at: inserted.last_login_at,
      created_at: inserted.created_at,
      updated_at: inserted.updated_at,
    };

    const token = generateToken({
      doctorId: safeDoctor.id,
      email: safeDoctor.email,
    });

    return { doctor: safeDoctor, token };
  }

  async login(data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ doctor: SafeDoctor; token: string }> {
    const supabase = getSupabaseClient();
    const emailLower = data.email.toLowerCase().trim();

    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (error) {
      throw ApiError.databaseError(`Database error during authentication: ${error.message}`);
    }

    if (!doctor) {
      throw ApiError.unauthorized('Invalid email address or password.');
    }

    const isMatch = await bcrypt.compare(data.password, doctor.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email address or password.');
    }

    // Update last login timestamp
    const lastLogin = new Date().toISOString();
    await supabase.from('doctors').update({ last_login_at: lastLogin }).eq('id', doctor.id);

    const safeDoctor: SafeDoctor = {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      hospital: doctor.hospital,
      phone: doctor.phone,
      professional_id: doctor.professional_id,
      avatar_url: doctor.avatar_url,
      notification_preferences: doctor.notification_preferences || {
        emailAlerts: true,
        highRiskAlerts: true,
        weeklyReport: true,
      },
      last_login_at: lastLogin,
      created_at: doctor.created_at,
      updated_at: doctor.updated_at,
    };

    const token = generateToken({
      doctorId: safeDoctor.id,
      email: safeDoctor.email,
    });

    return { doctor: safeDoctor, token };
  }

  async getMe(doctorId: string): Promise<SafeDoctor> {
    const supabase = getSupabaseClient();
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
}

export const authService = new AuthService();
