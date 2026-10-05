import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('clinical_ai_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: extract error message
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<any>) => {
    let errorMessage = 'An unexpected network error occurred.';
    let errorCode = 'NETWORK_ERROR';

    if (error.response) {
      errorMessage = error.response.data?.message || `Server returned error status ${error.response.status}`;
      errorCode = error.response.data?.code || `HTTP_${error.response.status}`;

      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('clinical_ai_token');
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to the backend server. Please verify the backend is running.';
      errorCode = 'SERVER_UNREACHABLE';
    }

    const enhancedError = new Error(errorMessage) as any;
    enhancedError.code = errorCode;
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    return Promise.reject(enhancedError);
  }
);
