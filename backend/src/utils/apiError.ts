export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, message: string, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: any) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Unauthorized access. Please login.', code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'Access forbidden to this resource.', code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message = 'Requested resource not found.', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static unprocessable(message: string, code = 'UNPROCESSABLE_ENTITY', details?: any) {
    return new ApiError(422, message, code, details);
  }

  static internal(message = 'Internal server error. Please try again later.', code = 'INTERNAL_SERVER_ERROR') {
    return new ApiError(500, message, code);
  }

  static databaseError(message = 'Database connection or query failure.', details?: any) {
    return new ApiError(503, message, 'DATABASE_ERROR', details);
  }

  static inferenceError(message = 'AI inference service failed to process request.', details?: any) {
    return new ApiError(502, message, 'INFERENCE_SERVICE_ERROR', details);
  }
}
