import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Building,
  Phone,
  Lock,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { profileService } from '../services/profileService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  hospital: z.string().min(2, 'Hospital is required'),
  phone: z.string().optional(),
  professionalId: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const DoctorProfile: React.FC = () => {
  const { doctor, updateDoctorState } = useAuth();
  const { success, error: toastError } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: doctor?.name || '',
      specialization: doctor?.specialization || '',
      qualification: doctor?.qualification || '',
      hospital: doctor?.hospital || '',
      phone: doctor?.phone || '',
      professionalId: doctor?.professional_id || '',
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      const updated = await profileService.updateProfile({
        name: data.name,
        specialization: data.specialization,
        qualification: data.qualification,
        hospital: data.hospital,
        phone: data.phone,
        professional_id: data.professionalId,
      });
      updateDoctorState(updated);
      success('Doctor profile updated successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      success('Password changed successfully.');
      resetPasswordForm();
    } catch (err: any) {
      toastError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-teal-600" />
          Doctor Profile & Credentials
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage clinical qualifications, hospital affiliation, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left ID Card Summary */}
        <Card className="p-6 border-slate-200 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200 text-teal-800 font-bold text-2xl mx-auto flex items-center justify-center shadow-inner">
            {doctor?.name
              ? doctor.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'MD'}
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">{doctor?.name}</h2>
            <p className="text-xs text-teal-700 font-semibold">{doctor?.qualification || 'MD'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{doctor?.specialization}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{doctor?.hospital}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{doctor?.email}</span>
            </div>
            {doctor?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{doctor.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Enrolled: {doctor?.created_at ? new Date(doctor.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Last login: {doctor?.last_login_at ? new Date(doctor.last_login_at).toLocaleString() : 'Active session'}</span>
            </div>
          </div>
        </Card>

        {/* Right Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Personal & Professional Details
            </h3>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <FormField label="Full Name & Title" error={profErrors.name?.message} required>
                <input type="text" {...regProfile('name')} className="clinical-input" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Specialization" error={profErrors.specialization?.message} required>
                  <input type="text" {...regProfile('specialization')} className="clinical-input" />
                </FormField>
                <FormField label="Medical Qualifications" error={profErrors.qualification?.message} required>
                  <input type="text" {...regProfile('qualification')} className="clinical-input" />
                </FormField>
              </div>

              <FormField label="Hospital / Affiliated Medical Center" error={profErrors.hospital?.message} required>
                <input type="text" {...regProfile('hospital')} className="clinical-input" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Contact Phone" error={profErrors.phone?.message}>
                  <input type="tel" {...regProfile('phone')} className="clinical-input" />
                </FormField>
                <FormField label="Medical License / ID" error={profErrors.professionalId?.message}>
                  <input type="text" {...regProfile('professionalId')} className="clinical-input" />
                </FormField>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
                  Save Profile Details
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Change Account Password
            </h3>

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <FormField label="Current Password" error={passErrors.currentPassword?.message} required>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...regPassword('currentPassword')}
                  className="clinical-input"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="New Password" error={passErrors.newPassword?.message} required>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...regPassword('newPassword')}
                    className="clinical-input"
                  />
                </FormField>
                <FormField label="Confirm New Password" error={passErrors.confirmNewPassword?.message} required>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...regPassword('confirmNewPassword')}
                    className="clinical-input"
                  />
                </FormField>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="secondary" size="sm" isLoading={isChangingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
