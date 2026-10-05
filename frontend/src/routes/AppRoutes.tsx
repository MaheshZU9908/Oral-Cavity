import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Patients } from '../pages/Patients';
import { PatientDetails } from '../pages/PatientDetails';
import { NewPrediction } from '../pages/NewPrediction';
import { PredictionHistory } from '../pages/PredictionHistory';
import { PredictionReport } from '../pages/PredictionReport';
import { Reports } from '../pages/Reports';
import { DoctorProfile } from '../pages/DoctorProfile';
import { Settings } from '../pages/Settings';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Clinical Workspace Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
        <Route path="/predictions/new" element={<NewPrediction />} />
        <Route path="/predictions" element={<PredictionHistory />} />
        <Route path="/predictions/:id" element={<PredictionReport />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<PredictionReport />} />
        <Route path="/profile" element={<DoctorProfile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Default Catch-all redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
