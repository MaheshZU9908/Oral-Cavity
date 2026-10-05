import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Building, Award, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';
import { Card } from '../components/common/Card';

const registerValidationSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    specialization: z.string().min(2, 'Specialization is required'),
    qualification: z.string().min(2, 'Medical qualification is required'),
    hospital: z.string().min(2, 'Hospital / Institution name is required'),
    phone: z.string().optional(),
    professionalId: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerValidationSchema>;

export const Register: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerValidationSchema),
    defaultValues: {
      name: 'Dr. ',
      email: '',
      specialization: 'Surgical Histopathology & Oncology',
      qualification: 'MD, FRCPath',
      hospital: 'Metropolitan University Medical Center',
      phone: '',
      professionalId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setAuthError(null);
    try {
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        specialization: data.specialization,
        qualification: data.qualification,
        hospital: data.hospital,
        phone: data.phone,
        professionalId: data.professionalId,
      });
      success('Doctor account successfully registered. Welcome to the clinical workspace.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      toastError(msg);
    }
  };

  return (
    <Card className="p-6 sm:p-8 border-slate-200 shadow-lg my-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Medical Account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Register attending doctor profile for AI decision-support access
        </p>
      </div>

      {authError && (
        <div className="mb-5 flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 leading-relaxed animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{authError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Full Name & Title" error={errors.name?.message} required>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Dr. Sarah Lin"
              {...register('name')}
              className="clinical-input pl-10"
            />
          </div>
        </FormField>

        <FormField label="Hospital Email" error={errors.email?.message} required>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="email"
              placeholder="s.lin@medcenter.org"
              {...register('email')}
              className="clinical-input pl-10"
            />
          </div>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Specialization" error={errors.specialization?.message} required>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Pathology / Oncology"
                {...register('specialization')}
                className="clinical-input pl-10"
              />
            </div>
          </FormField>

          <FormField label="Qualification" error={errors.qualification?.message} required>
            <input
              type="text"
              placeholder="MD, PhD, FCAP"
              {...register('qualification')}
              className="clinical-input"
            />
          </FormField>
        </div>

        <FormField label="Hospital / Medical Institute" error={errors.hospital?.message} required>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Memorial Hospital Center"
              {...register('hospital')}
              className="clinical-input pl-10"
            />
          </div>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Phone (Optional)" error={errors.phone?.message}>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="tel"
                placeholder="+1 555-0144"
                {...register('phone')}
                className="clinical-input pl-10"
              />
            </div>
          </FormField>

          <FormField label="Medical License / ID" error={errors.professionalId?.message}>
            <input
              type="text"
              placeholder="MD-839210"
              {...register('professionalId')}
              className="clinical-input"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Password" error={errors.password?.message} required>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="clinical-input pl-10"
              />
            </div>
          </FormField>

          <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="clinical-input pl-10"
              />
            </div>
          </FormField>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full py-2.5 mt-2"
          isLoading={isSubmitting}
        >
          Create Doctor Profile & Access Suite
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Already have a clinical account?{' '}
        <Link to="/login" className="font-semibold text-teal-700 hover:underline">
          Sign in here
        </Link>
      </div>
    </Card>
  );
};
