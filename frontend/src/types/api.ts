export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResult<T> {
  patients?: T[];
  predictions?: T[];
  reports?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
