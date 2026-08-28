import React, { useRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'accent' | 'outline' | 'ghost';
  href?: string;
  target?: string;
  rel?: string;
}

const baseStyles =
  'group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-[transform,background-color,border-color,box-shadow] duration-300 will-change-transform';

const variants = {
  accent:
    'bg-gradient-accent text-accent-foreground shadow-[0_18px_50px_-24px_var(--accent)] hover:shadow-[0_22px_60px_-20px_var(--accent)] hover:-translate-y-0.5',
  outline:
    'border border-border bg-surface/40 text-foreground hover:border-accent/60 hover:bg-surface hover:-translate-y-0.5',
  ghost: 'text-muted-foreground hover:text-foreground',
};

export function Button({
  children,
  className = '',
  variant = 'accent',
  href,
  target,
  rel,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.3;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = '';
    }
  };

  const combinedClass = `${baseStyles} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={combinedClass}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={combinedClass}
      {...props}
    >
      {children}
    </button>
  );
}
