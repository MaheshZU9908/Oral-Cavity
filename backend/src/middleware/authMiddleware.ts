import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { ApiError } from '../utils/apiError';
import { getSupabaseClient } from '../config/supabase';
import { SafeDoctor } from '../types';

declare global {
  namespace Express {
    interface Request {
      doctorId?: string;
      doctor?: SafeDoctor;
    }
  }
}

export const authenticateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is missing. Please sign in.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err: any) {
      throw ApiError.unauthorized('Invalid or expired authentication session. Please sign in again.');
    }

    const supabase = getSupabaseClient();
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select('id, name, email, specialization, qualification, hospital, phone, professional_id, avatar_url, notification_preferences, last_login_at, created_at, updated_at')
      .eq('id', decoded.doctorId)
      .single();

    if (error || !doctor) {
      throw ApiError.unauthorized('Doctor profile not found or session revoked.');
    }

    req.doctorId = doctor.id;
    req.doctor = {
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
      last_login_at: doctor.last_login_at,
      created_at: doctor.created_at,
      updated_at: doctor.updated_at,
    };

    next();
  } catch (error) {
    next(error);
  }
};
