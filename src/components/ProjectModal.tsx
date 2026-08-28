import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ProjectModal({
  project,
  onClose,
  onPrev,
  onNext,
}: ProjectModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [project.slug]);

  const metaItems = [
    { label: 'Client', value: project.client },
    { label: 'Category', value: project.categoryLabel },
    { label: 'Year', value: project.year },
    { label: 'Tools', value: project.tools.join(', ') },
  ].filter((item) => item.value);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} project details`}
      className="fixed inset-0 z-[60] flex items-start justify-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close project details"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background/85 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div
        ref={containerRef}
        className="relative z-10 mt-0 h-full w-full overflow-y-auto overscroll-contain bg-background duration-500 sm:mt-10 sm:h-[calc(100dvh-2.5rem)] sm:max-w-5xl sm:rounded-t-[2rem] sm:border sm:border-border shadow-2xl"
      >
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 glass px-5 py-4 sm:px-8">
          <p className="truncate font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
            {project.title}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous project"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent/60 hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next project"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent/60 hover:bg-surface"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent/60 hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <img
          src={project.hero}
          alt={`${project.title} — hero visual`}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />

        {/* Content Body */}
        <div className="px-5 py-10 sm:px-10 sm:py-14">
          <span className="text-xs uppercase tracking-[0.24em] text-accent">
            {project.categoryLabel}
          </span>
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl text-foreground">
            {project.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {project.description}
          </p>

          {/* Key Meta Details */}
          <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-border py-8 sm:grid-cols-4">
            {metaItems.map((item) => (
              <div key={item.label}>
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>

          {/* Objective & Process Sections */}
          {(project.objective || project.process) && (
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              {project.objective && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Design objective</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {project.objective}
                  </p>
                </div>
              )}
              {project.process && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Creative process</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {project.process}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Visual Gallery */}
          <div className="mt-12 grid gap-5">
            {project.gallery.map((imgSrc, idx) => (
              <img
                key={`${project.slug}-${idx}`}
                src={imgSrc}
                alt={`${project.title} — visual ${idx + 1}`}
                loading="lazy"
                className="w-full rounded-2xl border border-border object-cover"
              />
            ))}
          </div>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              Visit project <ArrowUpRight className="h-4 w-4" />
            </a>
          )}

          {/* Bottom Prev / Next Nav */}
          <div className="mt-14 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Previous project
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Next project <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
