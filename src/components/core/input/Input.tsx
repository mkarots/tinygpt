import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  wrapperClassName?: string;
  variant?: 'default' | 'ghost';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', wrapperClassName = '', variant = 'default', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const baseInputStyles = variant === 'default' 
      ? `w-full bg-white border rounded-lg py-2 
         ${leftIcon ? 'pl-10 pr-4' : 'px-4'}
         focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all
         disabled:bg-slate-50 disabled:text-slate-500
         ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500'}`
      : `w-full bg-transparent border-none focus:outline-none p-0 focus:ring-0
         disabled:cursor-not-allowed disabled:opacity-50`;

    return (
      <div className={`${variant === 'default' ? 'w-full' : ''} ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 ${variant === 'ghost' ? 'left-0' : ''}`}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseInputStyles} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
