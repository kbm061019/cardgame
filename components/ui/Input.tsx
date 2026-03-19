import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, helperText, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">
          {label}
        </label>
      )}
      <input
        className={`flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-black/20 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-blue-400 ${className}`}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">{helperText}</p>
      )}
    </div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = "", children, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
       {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">
          {label}
        </label>
      )}
      <select
        className={`flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-black/20 dark:text-zinc-100 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};
