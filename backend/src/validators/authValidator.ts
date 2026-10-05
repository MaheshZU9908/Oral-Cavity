import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  hospital: z.string().optional(),
  phone: z.string().optional(),
  professionalId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  specialization: z.string().max(100).optional(),
  qualification: z.string().max(100).optional(),
  hospital: z.string().max(150).optional(),
  phone: z.string().max(30).optional(),
  professionalId: z.string().max(50).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
  notificationPreferences: z
    .object({
      emailAlerts: z.boolean().optional(),
      highRiskAlerts: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
    })
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
