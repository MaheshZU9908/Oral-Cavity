import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading clinical data...',
  subMessage,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="p-3 bg-teal-50 text-teal-700 rounded-full mb-3 shadow-inner animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{message}</h4>
      {subMessage && <p className="text-xs text-slate-500 mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};
