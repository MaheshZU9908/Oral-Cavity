import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Microscope,
} from 'lucide-react';
import { patientService, PatientListParams } from '../services/patientService';
import { Patient, PatientFormData } from '../types/patient';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge } from '../components/common/RiskBadge';
import { Pagination } from '../components/common/Pagination';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { PatientModal } from './PatientModal';

export const Patients: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: PatientListParams = {
        page,
        limit,
        search: search.trim() || undefined,
        gender: (genderFilter as any) || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
      const data = await patientService.listPatients(params);
      setPatients(data.patients || []);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve patients list.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, genderFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [fetchPatients]);

  const handleCreatePatient = async (formData: PatientFormData) => {
    setIsSubmitting(true);
    try {
      await patientService.createPatient(formData);
      success('Patient record enrolled successfully.');
      fetchPatients();
    } catch (err: any) {
      toastError(err.message || 'Failed to create patient record.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePatient = async (formData: PatientFormData) => {
    if (!editingPatient) return;
    setIsSubmitting(true);
    try {
      await patientService.updatePatient(editingPatient.id, formData);
      success('Patient details updated successfully.');
      setEditingPatient(null);
      fetchPatients();
    } catch (err: any) {
      toastError(err.message || 'Failed to update patient.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!deletingPatient) return;
    setIsSubmitting(true);
    try {
      await patientService.deletePatient(deletingPatient.id);
      success(`Patient ${deletingPatient.patient_id} and associated predictions deleted.`);
      setDeletingPatient(null);
      fetchPatients();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete patient record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Patient Clinical Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage cohort records, clinical diagnoses, and Multi-Instance Learning predictions
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Patient
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Patient Name, ID (PT-XXXX), or Diagnosis..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="clinical-input pl-10"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={genderFilter}
              onChange={e => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="clinical-input w-full sm:w-40 text-xs"
            >
              <option value="">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-0 border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <LoadingState message="Loading patient records from database..." className="h-72" />
        ) : error ? (
          <div className="p-6">
            <ErrorState
              title="Unable to Load Patients"
              message={error}
              onRetry={fetchPatients}
            />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Patient Records Found"
              description={
                search || genderFilter
                  ? 'No patient records matched your search filters.'
                  : 'No patients are currently enrolled under your doctor profile.'
              }
              actionText="Enroll Patient"
              onAction={() => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Age / Sex</th>
                  <th className="py-3.5 px-4">Diagnosis</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  <th className="py-3.5 px-4">Latest MIL Risk</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                      {p.patient_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={p.diagnosis}>
                      {p.diagnosis}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {p.date_added || new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.latest_prediction ? (
                        <RiskBadge
                          category={p.latest_prediction.risk_category}
                          probability={p.latest_prediction.probability}
                          size="sm"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No analysis</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/predictions/new?patientId=${p.id}`)}
                          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition"
                          title="Run MIL Analysis for this patient"
                        >
                          <Microscope className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/patients/${p.id}`)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="View Patient Record & History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingPatient(p)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Patient Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPatient(p)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Patient Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && patients.length > 0 && (
          <div className="px-5 pb-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={newPage => setPage(newPage)}
            />
          </div>
        )}
      </Card>

      <PatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreatePatient}
        isLoading={isSubmitting}
      />

      <PatientModal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        onSubmit={handleUpdatePatient}
        patientToEdit={editingPatient}
        isLoading={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDeletePatient}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete patient ${deletingPatient?.full_name} (${deletingPatient?.patient_id}) and all associated biopsy histology predictions? This action cannot be undone.`}
        confirmText="Delete Patient"
        isDangerous
        isLoading={isSubmitting}
      />
    </div>
  );
};
