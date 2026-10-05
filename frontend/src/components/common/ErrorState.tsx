import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load clinical records',
  message = 'An unexpected error occurred while communicating with the backend services. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border border-rose-200 bg-rose-50/40 rounded-xl ${className}`}>
      <div className="p-3.5 bg-rose-100 text-rose-600 rounded-full mb-3 shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-rose-950">{title}</h4>
      <p className="text-xs text-rose-800/80 mt-1 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-rose-300 text-rose-900 hover:bg-rose-100"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};
