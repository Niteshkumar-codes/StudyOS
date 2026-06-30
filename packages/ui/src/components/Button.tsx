import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseStyle =
    'px-4 py-2 rounded-lg font-medium transition-transform duration-150 active:scale-95';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20',
  };

  const style = `${baseStyle} ${variants[variant]} ${className}`;

  return (
    <button className={style} {...props}>
      {children}
    </button>
  );
}
