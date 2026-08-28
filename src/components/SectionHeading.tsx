import React from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  label: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <Reveal
      className={
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'
      }
    >
      <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
        <span className="h-px w-8 bg-gradient-accent" aria-hidden="true" />
        {label}
      </span>
      <h2 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
