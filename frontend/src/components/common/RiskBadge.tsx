import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RiskCategory } from '../../types/patient';

export interface RiskBadgeProps {
  category: RiskCategory;
  probability?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  category,
  probability,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const normCategory = (category || 'LOW').toUpperCase() as RiskCategory;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold',
  }[size];

  const config = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
      label: 'LOW RISK',
    },
    MODERATE: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
      label: 'MODERATE RISK',
    },
    HIGH: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
      label: 'HIGH RISK',
    },
  }[normCategory] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: null,
    label: normCategory,
  };

  const probPercent = probability !== undefined ? `${Math.round(probability * 100)}%` : null;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium tracking-wide ${config.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      {probPercent && (
        <span className="opacity-75 font-mono text-[11px] font-normal">({probPercent})</span>
      )}
    </span>
  );
};
