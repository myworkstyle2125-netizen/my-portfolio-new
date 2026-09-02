import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
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
  ZoomIn,
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Reveal } from './Reveal';
import { Project } from '../types';
import { apiGetProjects } from '../lib/api';
import { PORTFOLIO_PROJECTS as INITIAL_PROJECTS, SITE_CONFIG } from '../data/siteData';
import {
  getCategoryDefinition,
  isProjectInCategory,
  toCategorySlug,
} from '../lib/categories';

interface ProjectDetailPageProps {
  categorySlug?: string;
  projectSlug: string;
  onNavigateHome: () => void;
  onNavigateCategory: (slug: string) => void;
  onNavigateProject: (categorySlug: string, projectSlug: string) => void;
}

export function ProjectDetailPage({
  categorySlug,
  projectSlug,
  onNavigateHome,
  onNavigateCategory,
  onNavigateProject,
}: ProjectDetailPageProps) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setActiveImageIndex(0);

    apiGetProjects(true)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => console.log('Using static projects cache:', err))
      .finally(() => setLoading(false));
  }, [projectSlug]);

  // Find project by slug or id
  const project = projects.find(
    (p) => p.slug === projectSlug || p.id === projectSlug
  ) || INITIAL_PROJECTS.find(
    (p) => p.slug === projectSlug || p.id === projectSlug
  );

  const resolvedCategorySlug = toCategorySlug(categorySlug || project?.category);
  const categoryDef = getCategoryDefinition(resolvedCategorySlug);

  // Get sibling projects in the same category for prev/next navigation
  const categoryProjects = projects.filter(
    (p) => p.published !== false && isProjectInCategory(p.category, resolvedCategorySlug)
  );

  const siblingList = categoryProjects.length > 0 ? categoryProjects : projects.filter((p) => p.published !== false);
  const currentIndex = siblingList.findIndex((p) => p.slug === projectSlug || p.id === projectSlug);

  const prevProject = currentIndex > 0 ? siblingList[currentIndex - 1] : siblingList[siblingList.length - 1];
  const nextProject = currentIndex < siblingList.length - 1 ? siblingList[currentIndex + 1] : siblingList[0];

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

  const currentImage = allImages[activeImageIndex] || project?.hero || project?.thumbnail || '/assets/work-jck.jpg';

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for images across all stored visuals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allImages.length <= 1) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length]);

  const whatsappMessage = encodeURIComponent(
    `Hi Shen, I was looking at your project "${project?.title || 'Design Work'}" (${project?.categoryLabel || project?.category}) on NIFTYGRAPHY and would like to discuss creating something similar for my brand!`
  );
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${whatsappMessage}`;

  if (!project && !loading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground font-sans">
        <Navbar />
        <main className="mx-auto max-w-4xl px-5 pt-36 pb-24 text-center">
          <h1 className="text-2xl font-bold">Project Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The requested case study could not be located.
          </p>
          <button
            type="button"
            onClick={onNavigateHome}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-semibold text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Works
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground font-sans">
      <Navbar />

      <main className="mx-auto max-w-[110rem] px-5 pt-28 pb-24 sm:px-8 sm:pt-36 sm:pb-32 lg:px-14">
        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border/70">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-foreground transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-foreground transition-colors"
            >
              Works
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onNavigateCategory(resolvedCategorySlug)}
              className="hover:text-accent transition-colors"
            >
              {categoryDef.name}
            </button>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">
              {project?.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateCategory(resolvedCategorySlug)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-accent/60 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to {categoryDef.name}
            </button>
          </div>
        </div>

        {/* Project Header Title & Meta */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/30 px-3.5 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{project?.categoryLabel || project?.category}</span>
              {project?.year && <span>• {project.year}</span>}
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {project?.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl">
              {project?.shortDescription || project?.description}
            </p>
          </div>

          {/* Quick Order / CTA Card */}
          <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-surface/80 p-5 sm:p-6 backdrop-blur-md shadow-xl lg:max-w-md ml-auto w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-accent">
                Start a Project
              </span>
              <span className="text-[0.68rem] text-muted-foreground">Fast 24-48h Delivery</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Like this artwork? Get custom graphics designed specifically for your brand or channel.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-accent px-5 py-3 text-xs font-semibold text-accent-foreground shadow-md transition-transform hover:scale-102"
            >
              <MessageSquare className="h-4 w-4" /> Order Similar on WhatsApp
            </a>
          </div>
        </div>

        {/* Big Showcase Visual / Gallery Hero */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-surface/90 shadow-2xl">
          <div className="relative flex min-h-[360px] sm:min-h-[540px] lg:min-h-[640px] items-center justify-center bg-black/50 p-4 sm:p-10">
            {/* Visual Counter Badge */}
            {allImages.length > 0 && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-background/85 px-3.5 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md border border-border shadow-lg">
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
                  aria-label="Previous visual"
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/80 hover:bg-background text-foreground border border-border/80 shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  title="Next artwork visual (Right Arrow)"
                  aria-label="Next visual"
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/80 hover:bg-background text-foreground border border-border/80 shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            <img
              src={currentImage}
              alt={`${project?.title} — Visual ${activeImageIndex + 1} of ${allImages.length}`}
              className={`max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl transition-all duration-300 ${
                isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Floating Zoom & Action Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-background/80 px-3.5 py-1.5 backdrop-blur-md border border-border text-xs text-foreground shadow-lg">
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

          {/* Multi-Row Artwork Gallery (Max 10 Images Per Row, Auto-Wrapping for All Images) */}
          {allImages.length > 1 && (
            <div className="border-t border-border/80 bg-surface/50 px-4 py-5 sm:px-8">
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Artwork Gallery ({allImages.length} Visuals)
                  </p>
                  <span className="text-[0.68rem] text-accent font-medium">
                    • Viewing Visual #{activeImageIndex + 1}
                  </span>
                </div>
                <span className="text-[0.72rem] text-muted-foreground">
                  Max 10 per row · Click any artwork to view
                </span>
              </div>

              {/* Responsive CSS Grid: Max 10 columns on desktop, wrapping automatically to as many rows as needed for ALL images */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-10 gap-2.5 sm:gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={`${project?.slug}-gallery-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIsZoomed(false);
                    }}
                    className={`group relative aspect-[16/11] w-full overflow-hidden rounded-xl border transition-all text-left ${
                      activeImageIndex === idx
                        ? 'border-accent ring-2 ring-accent/50 scale-[1.03] shadow-lg'
                        : 'border-border/80 opacity-75 hover:opacity-100 hover:border-accent/50 hover:scale-[1.02]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Artwork visual ${idx + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[0.62rem] font-bold text-white backdrop-blur-sm shadow">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Meta Specifications Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-4 sm:gap-6 sm:p-8">
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Client / Brand
            </span>
            <p className="mt-1 font-semibold text-foreground text-sm sm:text-base">
              {project?.client || 'Client Commission'}
            </p>
          </div>

          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Category
            </span>
            <p className="mt-1 font-semibold text-foreground text-sm sm:text-base">
              {project?.categoryLabel || project?.category}
            </p>
          </div>

          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Year Created
            </span>
            <p className="mt-1 font-semibold text-foreground text-sm sm:text-base">
              {project?.year || '2025'}
            </p>
          </div>

          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Tools Used
            </span>
            <p className="mt-1 font-semibold text-foreground text-sm sm:text-base">
              {project?.tools && project.tools.length > 0
                ? project.tools.join(', ')
                : 'Photoshop, Illustrator'}
            </p>
          </div>
        </div>

        {/* Case Study Details Section */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            {/* Full narrative */}
            {project?.description && (
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h3 className="text-lg font-bold text-foreground">Project Overview</h3>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}

            {/* Objective & Process */}
            {(project?.objective || project?.process) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {project.objective && (
                  <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Design Objective
                    </h4>
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {project.objective}
                    </p>
                  </div>
                )}

                {project.process && (
                  <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Wand2 className="h-4 w-4 text-accent" />
                      Creative Process
                    </h4>
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {project.process}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Creative Direction, Deliverables, URL */}
          <div className="space-y-6">
            {project?.creativeDirection && (
              <div className="rounded-3xl border border-border bg-surface p-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-accent">
                  Creative Direction
                </h4>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground">
                  {project.creativeDirection}
                </p>
              </div>
            )}

            {project?.servicesProvided && project.servicesProvided.length > 0 && (
              <div className="rounded-3xl border border-border bg-surface p-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Delivered Assets
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.servicesProvided.map((service, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-background px-3 py-1.5 text-xs font-medium text-foreground border border-border"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project?.results && (
              <div className="rounded-3xl border border-border bg-surface p-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Key Outcomes
                </h4>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {project.results}
                </p>
              </div>
            )}

            {project?.url && (
              <div className="rounded-3xl border border-border bg-surface p-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Live Project Link
                </h4>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-background border border-border px-4 py-2 text-xs font-medium text-accent hover:border-accent"
                >
                  <ExternalLink className="h-4 w-4" /> Visit External Link
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Previous / Next Project Navigation Bar */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80 pt-8">
          {prevProject ? (
            <button
              type="button"
              onClick={() => onNavigateProject(toCategorySlug(prevProject.category), prevProject.slug)}
              className="group flex items-center gap-3 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors group-hover:border-accent">
                <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
              </div>
              <div>
                <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground block">
                  Previous Project
                </span>
                <span className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                  {prevProject.title}
                </span>
              </div>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={() => onNavigateCategory(resolvedCategorySlug)}
            className="rounded-full border border-border bg-surface px-5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent"
          >
            View All {categoryDef.name} Works
          </button>

          {nextProject ? (
            <button
              type="button"
              onClick={() => onNavigateProject(toCategorySlug(nextProject.category), nextProject.slug)}
              className="group flex items-center gap-3 text-right"
            >
              <div>
                <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground block">
                  Next Project
                </span>
                <span className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                  {nextProject.title}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface transition-colors group-hover:border-accent">
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
              </div>
            </button>
          ) : <div />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
