import React from 'react';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'small' | 'error' | 'success';
  className?: string;
}

export const Text: React.FC<TextProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: "text-ink text-base",
    muted: "text-stone text-sm",
    small: "text-xs text-stone",
    error: "text-red-500 text-sm",
    success: "text-green-500 text-sm",
  };

  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

