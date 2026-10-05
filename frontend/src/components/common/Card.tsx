import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl shadow-sm p-5 ${
        hoverable ? 'hover:border-slate-300 hover:shadow-md transition duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
