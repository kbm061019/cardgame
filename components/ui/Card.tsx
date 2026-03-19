import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 transition-standard bg-white border border-zinc-200 shadow hover:shadow-lg dark:bg-zinc-900/50 dark:border-zinc-800 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => (
  <h3 className={`text-xl font-bold text-zinc-900 dark:text-zinc-100 ${className}`}>{children}</h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`${className}`}>{children}</div>
);
