import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProjectModal } from './ProjectModal';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { CATEGORIES as INITIAL_CATEGORIES, PORTFOLIO_PROJECTS as INITIAL_PROJECTS } from '../data/siteData';
import { Category, Project } from '../types';
import { apiGetCategories, apiGetProjects } from '../lib/api';

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    // Fetch live published projects
    apiGetProjects(true)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => console.log('Using static projects cache:', err));

    // Fetch dynamic categories
    apiGetCategories()
      .then((data: Category[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const names = ['All', ...data.filter((c) => c.published !== false).map((c) => c.name)];
          // Deduplicate
          setCategories(Array.from(new Set(names)));
        }
      })
      .catch((err) => console.log('Using static categories cache:', err));
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter(
      (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [projects, activeCategory]);

  const activeProject =
    selectedIndex !== null ? filteredProjects[selectedIndex] ?? null : null;

  const navigateProject = (step: number) => {
    setSelectedIndex((curr) => {
      if (curr === null) return curr;
      const total = filteredProjects.length;
      return (curr + step + total) % total;
    });
  };

  return (
    <section
      id="works"
      className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14"
    >
      <SectionHeading
        label="Portfolio"
        title={
          <>
            Selected <span className="text-gradient">Design Works</span>
          </>
        }
        subtitle="A curated collection of branding, social media, thumbnails and visual design projects crafted with precision."
      />

      {/* Filter Tabs */}
      <Reveal delay={80}>
        <div
          role="tablist"
          aria-label="Filter works by category"
          className="mt-10 flex flex-wrap items-center gap-2"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIndex(null);
                }}
                className={`rounded-full px-5 py-2 text-xs font-medium transition-all duration-300 sm:text-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-surface/30 text-muted-foreground hover:border-accent/50 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Projects Grid */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project, idx) => (
          <Reveal
            key={project.id || project.slug}
            delay={(idx % 3) * 90}
            className={`group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface ${
              project.shape === 'tall'
                ? 'row-span-2 min-h-[440px]'
                : 'row-span-1 min-h-[340px] sm:row-span-2 lg:row-span-1'
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View ${project.title} project details`}
              className="absolute inset-0 h-full w-full text-left"
            >
              <img
                src={project.thumbnail}
                alt={`${project.title} — ${project.categoryLabel || project.category} design work`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />

              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/10 opacity-90 transition-opacity duration-500 group-hover:opacity-100"
              />

              <span className="absolute inset-x-0 bottom-0 block p-6">
                <span className="block text-[0.65rem] uppercase tracking-[0.24em] text-accent">
                  {project.categoryLabel || project.category}
                  {project.year ? ` · ${project.year}` : ''}
                </span>

                <span className="mt-2 block font-display text-xl font-semibold text-foreground sm:text-2xl">
                  {project.title}
                </span>

                <span className="mt-2 block max-h-0 overflow-hidden text-sm leading-relaxed text-muted-foreground opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                  {project.shortDescription || project.description}
                </span>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  View Project
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Modal Dialog */}
      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => navigateProject(-1)}
          onNext={() => navigateProject(1)}
        />
      )}
    </section>
  );
}
