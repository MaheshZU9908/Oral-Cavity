import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../components/common/Modal';
import { FormField } from '../components/common/FormField';
import { Button } from '../components/common/Button';
import { Patient, PatientFormData } from '../types/patient';

const patientSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  age: z.coerce.number().int().min(0, 'Age must be >= 0').max(130, 'Age must be <= 130'),
  gender: z.enum(['Male', 'Female', 'Other']),
  contact: z.string().max(100).optional(),
  diagnosis: z.string().min(2, 'Clinical diagnosis is required').max(500),
  clinicalHistory: z.string().max(2000).optional(),
  biopsyInformation: z.string().max(1000).optional(),
});

export interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  patientToEdit?: Patient | null;
  isLoading?: boolean;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientToEdit,
  isLoading = false,
}) => {
  const isEditing = !!patientToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: '',
      age: 45,
      gender: 'Female',
      contact: '',
      diagnosis: '',
      clinicalHistory: '',
      biopsyInformation: '',
    },
  });

  useEffect(() => {
    if (patientToEdit) {
      reset({
        fullName: patientToEdit.full_name,
        age: patientToEdit.age,
        gender: patientToEdit.gender,
        contact: patientToEdit.contact || '',
        diagnosis: patientToEdit.diagnosis,
        clinicalHistory: patientToEdit.clinical_history || '',
        biopsyInformation: patientToEdit.biopsy_information || '',
      });
    } else {
      reset({
        fullName: '',
        age: 45,
        gender: 'Female',
        contact: '',
        diagnosis: '',
        clinicalHistory: '',
        biopsyInformation: '',
      });
    }
  }, [patientToEdit, reset, isOpen]);

  const handleFormSubmit = async (data: PatientFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Patient: ${patientToEdit?.patient_id}` : 'Enroll New Patient Record'}
      subtitle={
        isEditing
          ? 'Update medical demographic and clinical diagnosis details'
          : 'Create patient record before initiating histology biopsy prediction'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormField label="Full Name" error={errors.fullName?.message} required>
              <input
                type="text"
                placeholder="e.g. Eleanor Vance"
                {...register('fullName')}
                className="clinical-input"
              />
            </FormField>
          </div>

          <div>
            <FormField label="Age" error={errors.age?.message} required>
              <input
                type="number"
                placeholder="54"
                {...register('age')}
                className="clinical-input"
              />
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Gender" error={errors.gender?.message} required>
            <select {...register('gender')} className="clinical-input">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          <FormField label="Contact / MRN" error={errors.contact?.message}>
            <input
              type="text"
              placeholder="e.g. +1 555-0182 / MRN-9921"
              {...register('contact')}
              className="clinical-input"
            />
          </FormField>
        </div>

        <FormField label="Clinical Diagnosis" error={errors.diagnosis?.message} required>
          <input
            type="text"
            placeholder="e.g. Invasive Mammary Carcinoma, NST (Grade II, cT2N0M0)"
            {...register('diagnosis')}
            className="clinical-input"
          />
        </FormField>

        <FormField
          label="Clinical & Surgical History"
          error={errors.clinicalHistory?.message}
          helpText="Prior biopsies, chemotherapeutic regimens, or surgical lumpectomy notes"
        >
          <textarea
            rows={2}
            placeholder="Summary of patient past clinical history..."
            {...register('clinicalHistory')}
            className="clinical-input resize-none"
          />
        </FormField>

        <FormField
          label="Biopsy Specimen Context"
          error={errors.biopsyInformation?.message}
          helpText="Anatomical site, needle core gauge, or sentinel lymph node localization"
        >
          <textarea
            rows={2}
            placeholder="e.g. Sentinel lymph node biopsy, Level I axilla, H&E frozen section..."
            {...register('biopsyInformation')}
            className="clinical-input resize-none"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Patient Changes' : 'Enroll Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
