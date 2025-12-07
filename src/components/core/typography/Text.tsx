import React from 'react';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'small' | 'error' | 'success';
  className?: string;
}

export const Text: React.FC<TextProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: "text-slate-700 text-base",
    muted: "text-slate-500 text-sm",
    small: "text-xs text-slate-500",
    error: "text-red-500 text-sm",
    success: "text-green-500 text-sm",
  };

  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

