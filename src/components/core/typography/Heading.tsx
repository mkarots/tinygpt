import React from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ level = 1, children, className = '', ...props }) => {
  const Tag = `h${level}` as React.ElementType;
  
  const baseStyles = "font-bold text-slate-900";
  const sizeStyles = {
    1: "text-3xl tracking-tight",
    2: "text-2xl",
    3: "text-xl",
    4: "text-lg",
    5: "text-base",
    6: "text-sm uppercase tracking-wider",
  };

  return (
    <Tag className={`${baseStyles} ${sizeStyles[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

