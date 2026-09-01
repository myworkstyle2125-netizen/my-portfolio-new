import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Filter, Layers, Sparkles } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Reveal } from './Reveal';
import { Project } from '../types';
import { apiGetProjects } from '../lib/api';
import { PORTFOLIO_PROJECTS as INITIAL_PROJECTS } from '../data/siteData';
import {
  PORTFOLIO_CATEGORIES,
  getCategoryDefinition,
  isProjectInCategory,
  toCategorySlug,
} from '../lib/categories';
import { ProjectModal } from './ProjectModal';

interface CategoryPageProps {
  categorySlug: string;
  onNavigateCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigateProject: (categorySlug: string, projectSlug: string) => void;
}

export function CategoryPage({
  categorySlug,
  onNavigateCategory,
  onNavigateHome,
  onNavigateProject,
}: CategoryPageProps) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const currentCategory = getCategoryDefinition(categorySlug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);

    apiGetProjects(true)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => console.log('Using static projects cache:', err))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  // Strict filtering: Only projects belonging strictly to this category
  const categoryProjects = projects
    .filter((p) => p.published !== false && isProjectInCategory(p.category, currentCategory.slug))
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  // Modal navigation
  const currentIndex = selectedProject
    ? categoryProjects.findIndex((p) => (p.id && p.id === selectedProject.id) || p.slug === selectedProject.slug)
    : -1;

  const handleNavigateModal = (step: number) => {
    if (currentIndex === -1 || categoryProjects.length === 0) return;
    const nextIdx = (currentIndex + step + categoryProjects.length) % categoryProjects.length;
    setSelectedProject(categoryProjects[nextIdx]);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground font-sans">
      <Navbar />

      <main className="mx-auto max-w-[110rem] px-5 pt-28 pb-24 sm:px-8 sm:pt-36 sm:pb-32 lg:px-14">
        {/* Top Breadcrumb & Back Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-border/70">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
            <span className="text-accent font-semibold">{currentCategory.name}</span>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-1.5 text-xs font-medium text-foreground hover:border-accent/60 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to All Works
          </button>
        </div>

        {/* Category Hero Banner */}
        <div className="mt-10 max-w-4xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/30 px-3.5 py-1 text-xs font-semibold text-accent">
              <Layers className="h-3.5 w-3.5" />
              <span>{currentCategory.subtitle}</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {currentCategory.name} <span className="text-gradient">Portfolio</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl">
              {currentCategory.description}
            </p>
          </Reveal>
        </div>

        {/* 6-Category Navigation Switcher */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-border/60 pb-6">
          <button
            type="button"
            onClick={onNavigateHome}
            className="rounded-full border border-border bg-surface/30 px-5 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:border-accent/50 hover:text-foreground transition-all"
          >
            All Works
          </button>

          {PORTFOLIO_CATEGORIES.map((cat) => {
            const isActive = cat.slug === currentCategory.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onNavigateCategory(cat.slug)}
                className={`rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-surface/30 text-muted-foreground hover:border-accent/50 hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="mt-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : categoryProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted-foreground mb-3">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No {currentCategory.name} projects published yet
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Check back soon or explore our other design disciplines.
              </p>
              <button
                type="button"
                onClick={onNavigateHome}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground"
              >
                Explore All Works
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-7">
              {categoryProjects.map((project, idx) => (
                <Reveal key={project.id || project.slug || idx} delay={(idx % 3) * 80}>
                  <div
                    className={`group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-lg transition-all duration-300 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 ${
                      project.shape === 'tall' ? 'min-h-[460px]' : 'min-h-[360px]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onNavigateProject(currentCategory.slug, project.slug)}
                      aria-label={`View ${project.title} project details`}
                      className="absolute inset-0 h-full w-full text-left focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <img
                        src={project.thumbnail || project.hero || '/assets/work-jck.jpg'}
                        alt={`${project.title} — ${project.categoryLabel || project.category}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />

                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95"
                      />

                      <span className="absolute inset-x-0 bottom-0 block p-6 sm:p-7">
                        <span className="block text-[0.68rem] uppercase tracking-[0.24em] font-semibold text-accent">
                          {project.categoryLabel || project.category}
                          {project.year ? ` · ${project.year}` : ''}
                        </span>

                        <span className="mt-1.5 block font-display font-bold text-foreground text-xl sm:text-2xl leading-tight">
                          {project.title}
                        </span>

                        {(project.shortDescription || project.description) && (
                          <span className="mt-2 block text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
                            {project.shortDescription || project.description}
                          </span>
                        )}

                        <span className="mt-3.5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                          View Project Details
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </span>
                      </span>
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Case Study Modal (if triggered directly) */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onPrev={() => handleNavigateModal(-1)}
          onNext={() => handleNavigateModal(1)}
        />
      )}

      <Footer />
    </div>
  );
}
