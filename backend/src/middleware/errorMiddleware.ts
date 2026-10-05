import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`[Error] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    code: err.code,
  });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      message: 'Validation failed on input data.',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
    });
    return;
  }

  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      code: 'UPLOAD_ERROR',
    });
    return;
  }

  // Fallback 500 error
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
    code: 'INTERNAL_SERVER_ERROR',
  });
};
