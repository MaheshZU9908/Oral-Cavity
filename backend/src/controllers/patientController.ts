import { Request, Response, NextFunction } from 'express';
import { patientService } from '../services/patientService';
import { createPatientSchema, updatePatientSchema, patientQuerySchema } from '../validators/patientValidator';

export class PatientController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = patientQuerySchema.parse(req.query);
      const result = await patientService.listPatients(req.doctorId!, query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const patient = await patientService.getPatientById(req.doctorId!, id);
      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createPatientSchema.parse(req.body);
      const patient = await patientService.createPatient(req.doctorId!, validated);
      res.status(201).json({
        success: true,
        message: 'Patient record created successfully.',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const validated = updatePatientSchema.parse(req.body);
      const patient = await patientService.updatePatient(req.doctorId!, id, validated);
      res.status(200).json({
        success: true,
        message: 'Patient record updated successfully.',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await patientService.deletePatient(req.doctorId!, id);
      res.status(200).json({
        success: true,
        message: 'Patient record deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
