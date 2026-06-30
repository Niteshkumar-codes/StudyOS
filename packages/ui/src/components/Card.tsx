import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ glass = true, className = '', children, ...props }: CardProps) {
  const baseStyle = 'p-6 rounded-xl border transition-all duration-300';

  const styles = glass
    ? 'bg-slate-900/75 backdrop-blur-md border-white/5 shadow-2xl shadow-black/40'
    : 'bg-slate-900 border-slate-800 shadow-md';

  return (
    <div className={`${baseStyle} ${styles} ${className}`} {...props}>
      {children}
    </div>
  );
}
