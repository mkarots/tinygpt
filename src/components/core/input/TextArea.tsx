import React, { forwardRef, useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const textAreaId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textAreaId} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          className={`
            w-full bg-white border rounded-lg px-4 py-2 
            focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

