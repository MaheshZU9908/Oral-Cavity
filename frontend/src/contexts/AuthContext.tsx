import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Doctor, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  doctor: Doctor | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateDoctorState: (updated: Doctor) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('clinical_ai_token');

    if (!token) {
      setDoctor(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentDoctor = await authService.getMe();
      setDoctor(currentDoctor);
    } catch (err: any) {
      console.warn('Authentication session check failed:', err.message);
      // Clear token if invalid or expired
      localStorage.removeItem('clinical_ai_token');
      setDoctor(null);
      if (err.code === 'SERVER_UNREACHABLE') {
        setError('Unable to connect to the authentication service. Please check your backend connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      setDoctor(res.doctor);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      setDoctor(res.doctor);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setDoctor(null);
      setIsLoading(false);
    }
  };

  const updateDoctorState = (updated: Doctor) => {
    setDoctor(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        isLoading,
        error,
        login,
        register,
        logout,
        updateDoctorState,
        isAuthenticated: !!doctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
