import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reportService';

export class ReportController {
  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const report = await reportService.getPredictionReport(req.doctorId!, id);
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async listReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reportService.listAllReports(req.doctorId!, req.query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
