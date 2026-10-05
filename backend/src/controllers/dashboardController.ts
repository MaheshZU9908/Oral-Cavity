import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await dashboardService.getSummary(req.doctorId!);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
