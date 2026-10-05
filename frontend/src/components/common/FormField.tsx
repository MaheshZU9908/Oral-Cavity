import React from 'react';

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  helpText,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </span>
      </label>
      {children}
      {error && <span className="text-xs text-rose-600 mt-1 font-medium">{error}</span>}
      {!error && helpText && <span className="text-xs text-slate-500 mt-1">{helpText}</span>}
    </div>
  );
};
