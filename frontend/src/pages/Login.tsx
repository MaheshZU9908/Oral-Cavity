import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';
import { Card } from '../components/common/Card';

const loginValidationSchema = z.object({
  email: z.string().email('Please enter a valid hospital email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginValidationSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginValidationSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      success('Authenticated successfully. Welcome back, Doctor.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Unable to connect to the authentication service. Please try again.';
      setAuthError(msg);
      toastError(msg);
    }
  };

  return (
    <Card className="p-6 sm:p-8 border-slate-200 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Doctor Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">
          Access the clinical decision-support portal with your medical credentials
        </p>
      </div>

      {authError && (
        <div className="mb-5 flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 leading-relaxed animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{authError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email Address" error={errors.email?.message} required>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="email"
              placeholder="doctor@hospital.org"
              {...register('email')}
              className="clinical-input pl-10"
              autoComplete="email"
            />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="clinical-input pl-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between mt-2 mb-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Remember my session</span>
          </label>

          <a
            href="#forgot-password"
            onClick={e => {
              e.preventDefault();
              alert('Please contact your hospital system administrator for credentials recovery.');
            }}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full py-2.5"
          isLoading={isSubmitting}
        >
          Sign In to Clinical Portal
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        New physician or investigator?{' '}
        <Link to="/register" className="font-semibold text-teal-700 hover:underline">
          Register medical profile
        </Link>
      </div>
    </Card>
  );
};
