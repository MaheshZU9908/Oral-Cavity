import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profileService';
import { updateProfileSchema, changePasswordSchema } from '../validators/authValidator';

export class ProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await profileService.getProfile(req.doctorId!);
      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await profileService.updateProfile(req.doctorId!, validated);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = changePasswordSchema.parse(req.body);
      await profileService.changePassword(req.doctorId!, validated);
      res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
