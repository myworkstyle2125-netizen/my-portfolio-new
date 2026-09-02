import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  Layers,
  Maximize2,
  MessageSquare,
  Sparkles,
  Wand2,
  X,
  ZoomIn
} from 'lucide-react';
import { Project } from '../types';
import { SITE_CONFIG } from '../data/siteData';

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Comprehensively aggregate ALL stored images without arbitrary limits
  const allImages = useMemo(() => {
    if (!project) return [];
    const list: string[] = [];
    const seen = new Set<string>();

    const addImg = (url?: string) => {
      if (!url || typeof url !== 'string' || !url.trim()) return;
      const clean = url.trim();
      if (!seen.has(clean)) {
        seen.add(clean);
        list.push(clean);
      }
    };

    addImg(project.hero);
    addImg(project.thumbnail);
    if (Array.isArray(project.gallery)) {
      for (const g of project.gallery) {
        addImg(g);
      }
    }
    return list;
  }, [project]);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsZoomed(false);
  }, [project.slug]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft') {
        if (allImages.length > 1) {
          handlePrevImage();
        } else {
          onPrev();
        }
      }
      if (e.key === 'ArrowRight') {
        if (allImages.length > 1) {
          handleNextImage();
        } else {
          onNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext, isZoomed, allImages.length]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [project.slug]);

  const currentImage = allImages[activeImageIndex] || project.hero || project.thumbnail;

  const whatsappMessage = encodeURIComponent(
    `Hi Shen, I saw your project "${project.title}" (${project.categoryLabel || project.category}) on NIFTYGRAPHY and would love to discuss a similar project!`
  );
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${whatsappMessage}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} Lightbox & Project Details`}
      className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close Lightbox"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background/90 backdrop-blur-xl transition-opacity duration-300"
      />

      {/* Main Lightbox Modal Window */}
      <div
        ref={containerRef}
        className="relative z-10 flex h-full w-full max-w-6xl flex-col overflow-hidden bg-surface/95 border border-border/80 shadow-2xl rounded-none sm:rounded-[2rem] sm:h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-background/80 px-4 py-3 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3 truncate pr-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3 w-3" />
              {project.categoryLabel || project.category}
            </span>
            <h3 className="truncate font-display text-sm font-semibold text-foreground sm:text-base">
              {project.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prev / Next navigation */}
            <button
              type="button"
              onClick={onPrev}
              title="Previous project (Left arrow)"
              aria-label="Previous project"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-accent hover:bg-accent/10 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              title="Next project (Right arrow)"
              aria-label="Next project"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-accent hover:bg-accent/10 active:scale-95"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mx-1 h-5 w-[1px] bg-border" />

            {/* Close Button */}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              title="Close popup (Esc)"
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-destructive hover:bg-destructive/10 hover:text-destructive active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Visual Showcase / Lightbox Hero */}
          <div className="relative flex min-h-[320px] sm:min-h-[460px] lg:min-h-[520px] items-center justify-center bg-black/40 p-4 sm:p-8">
            {/* Visual Counter Badge */}
            {allImages.length > 0 && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md border border-border shadow-lg">
                <Images className="h-3.5 w-3.5 text-accent" />
                <span>Visual {activeImageIndex + 1} of {allImages.length}</span>
              </div>
            )}

            {/* Left / Right Main Visual Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  title="Previous artwork visual (Left Arrow)"
                  aria-label="Previous artwork image"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-background/80 hover:bg-background text-foreground border border-border/80 shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  title="Next artwork visual (Right Arrow)"
                  aria-label="Next artwork image"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-background/80 hover:bg-background text-foreground border border-border/80 shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            <div className="relative max-h-[70vh] w-full flex items-center justify-center">
              <img
                src={currentImage}
                alt={`${project.title} — visual ${activeImageIndex + 1} of ${allImages.length}`}
                className={`max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-2xl transition-all duration-300 ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in hover:opacity-95'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Floating Zoom & Action Controls */}
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur-md border border-border text-xs text-foreground shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-accent"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  {isZoomed ? 'Fit Screen' : 'Zoom Image'}
                </button>
                <span className="text-border">|</span>
                <a
                  href={currentImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium hover:text-accent"
                  title="Open full resolution in new tab"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Full Res
                </a>
              </div>
            </div>
          </div>

          {/* Multi-Row Artwork Gallery (Max 10 Images Per Row, Auto-Wrapping for All Images) */}
          {allImages.length > 1 && (
            <div className="border-b border-border/80 bg-background/50 px-4 py-4 sm:px-8">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Artwork Gallery ({allImages.length} Visuals)
                  </p>
                  <span className="text-[0.68rem] text-accent font-medium">
                    • Viewing Visual #{activeImageIndex + 1}
                  </span>
                </div>
                <span className="text-[0.72rem] text-muted-foreground">
                  Max 10 per row · Click to view
                </span>
              </div>

              {/* Responsive CSS Grid: Max 10 columns on desktop, wrapping automatically to as many rows as needed for ALL images */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-10 gap-2 sm:gap-2.5">
                {allImages.map((img, idx) => (
                  <button
                    key={`${project.slug}-modal-gallery-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={`group relative aspect-[16/11] w-full overflow-hidden rounded-lg border transition-all text-left ${
                      activeImageIndex === idx
                        ? 'border-accent ring-2 ring-accent/50 scale-[1.03] shadow-md'
                        : 'border-border/80 opacity-75 hover:opacity-100 hover:border-accent/40 hover:scale-[1.02]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Artwork visual ${idx + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1 py-0.5 text-[0.6rem] font-bold text-white backdrop-blur-sm shadow">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details & Case Study Information */}
          <div className="px-5 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent">
                  <span>{project.categoryLabel || project.category}</span>
                  {project.year && <span>• {project.year}</span>}
                </div>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {project.title}
                </h2>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {project.description || project.shortDescription}
                </p>
              </div>

              {/* Action Call to Action Card */}
              <div className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-5 lg:w-80">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Interested in this design?
                </p>
                <p className="text-xs text-muted-foreground">
                  Order a similar artwork or custom visual package crafted for your brand.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 active:scale-98"
                >
                  <MessageSquare className="h-4 w-4" />
                  Order on WhatsApp
                </a>
              </div>
            </div>

            {/* Key Meta Specs */}
            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface/40 p-5 sm:grid-cols-4 sm:gap-6 sm:p-6">
              <div>
                <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Client / Brand
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {project.client || 'Client Commission'}
                </p>
              </div>
              <div>
                <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Category
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {project.categoryLabel || project.category}
                </p>
              </div>
              <div>
                <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Year Created
                </span>
                <p className="mt-1 font-semibold text-foreground">{project.year || '2025'}</p>
              </div>
              <div>
                <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Tools Used
                </span>
                <p className="mt-1 font-semibold text-foreground">
                  {project.tools && project.tools.length > 0
                    ? project.tools.join(', ')
                    : 'Photoshop, Illustrator'}
                </p>
              </div>
            </div>

            {/* Creative Process / Objective Blocks */}
            {(project.objective || project.process || project.creativeDirection) && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {project.objective && (
                  <div className="rounded-2xl border border-border bg-surface/30 p-5 sm:p-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Design Objective
                    </h4>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {project.objective}
                    </p>
                  </div>
                )}
                {(project.process || project.creativeDirection) && (
                  <div className="rounded-2xl border border-border bg-surface/30 p-5 sm:p-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Wand2 className="h-4 w-4 text-accent" />
                      Creative Direction & Process
                    </h4>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {project.process || project.creativeDirection}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Results / Services Deliverables */}
            {(project.results || (project.servicesProvided && project.servicesProvided.length > 0)) && (
              <div className="mt-6 rounded-2xl border border-border bg-surface/30 p-5 sm:p-6">
                {project.servicesProvided && project.servicesProvided.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      Delivered Assets
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.servicesProvided.map((service, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1 text-xs font-medium text-foreground border border-border"
                        >
                          <CheckCircle2 className="h-3 w-3 text-accent" />
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.results && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      Key Outcomes
                    </span>
                    <p className="mt-1 text-sm text-foreground font-medium">{project.results}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Footer Navigation */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Previous Project
              </button>

              <p className="text-xs text-muted-foreground">
                Tip: Use Left / Right arrow keys to browse
              </p>

              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Next Project <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

