import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProjectModal } from './ProjectModal';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { CATEGORIES as INITIAL_CATEGORIES, PORTFOLIO_PROJECTS as INITIAL_PROJECTS } from '../data/siteData';
import { Category, Project } from '../types';
import { apiGetCategories, apiGetProjects } from '../lib/api';

const FEATURED_SLUGS = [
  'jck-crypto-exchange',
  'nifty-academy',
  'creative-brand-identity',
  'youtube-thumbnail-collection',
  'modern-business-campaign',
  'social-media-design-collection',
];

interface ProjectCardProps {
  key?: React.Key;
  project: Project;
  onClick: () => void;
  className?: string;
  isLarge?: boolean;
}

function ProjectCard({ project, onClick, className = '', isLarge = false }: ProjectCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-lg transition-all duration-300 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 ${className}`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`View ${project.title} project details`}
        className="absolute inset-0 h-full w-full text-left focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <img
          src={project.thumbnail}
          alt={`${project.title} — ${project.categoryLabel || project.category}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Subtle dark gradient overlay for crystal clear readability */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95"
        />

        {/* Card Content & Details */}
        <span className="absolute inset-x-0 bottom-0 block p-6 sm:p-7">
          <span className="block text-[0.68rem] uppercase tracking-[0.24em] font-semibold text-accent">
            {project.categoryLabel || project.category}
            {project.year ? ` · ${project.year}` : ''}
          </span>

          <span
            className={`mt-1.5 block font-display font-bold text-foreground leading-tight ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {project.title}
          </span>

          {(project.shortDescription || project.description) && (
            <span className="mt-2 block text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {project.shortDescription || project.description}
            </span>
          )}

          <span className="mt-3.5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
            View Project
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </span>
      </button>
    </div>
  );
}

import {
  APPROVED_PROJECT_CATEGORIES,
  PORTFOLIO_CATEGORIES,
  isProjectInCategory,
  toCategorySlug,
} from '../lib/categories';

interface PortfolioProps {
  onNavigateCategory?: (categorySlug: string) => void;
  onNavigateProject?: (categorySlug: string, projectSlug: string) => void;
}

export function Portfolio({ onNavigateCategory, onNavigateProject }: PortfolioProps = {}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    // Fetch live published projects from API / local database
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
          const dynamicApproved = data
            .filter((c) => c.published !== false && INITIAL_CATEGORIES.includes(c.name))
            .map((c) => c.name);
          const list = INITIAL_CATEGORIES.filter(
            (c) => c === 'All' || dynamicApproved.includes(c) || INITIAL_CATEGORIES.includes(c)
          );
          setCategories(list.length > 0 ? list : INITIAL_CATEGORIES);
        }
      })
      .catch((err) => console.log('Using static categories cache:', err));
  }, []);

  // Filtered projects for category views strictly using isProjectInCategory
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => isProjectInCategory(p.category, activeCategory));
  }, [projects, activeCategory]);

  // Extract the 6 featured projects in the requested exact order
  const featuredProjects = useMemo(() => {
    // Live database projects take absolute precedence
    const liveList = projects && projects.length > 0 ? projects : INITIAL_PROJECTS;

    const idMap = new Map<string, Project>();
    const slugMap = new Map<string, Project>();
    const titleMap = new Map<string, Project>();

    liveList.forEach((p) => {
      if (p.id) idMap.set(p.id, p);
      if (p.slug) slugMap.set(p.slug, p);
      if (p.title) titleMap.set(p.title.toLowerCase().trim(), p);
    });

    const list: Project[] = [];

    // Match each of the 6 canonical slots by ID, slug, display order, or index
    FEATURED_SLUGS.forEach((slug, idx) => {
      const canonicalId = `proj-${idx + 1}`;
      const found =
        idMap.get(canonicalId) ||
        slugMap.get(slug) ||
        liveList.find((p) => p.displayOrder === idx + 1) ||
        liveList[idx] ||
        INITIAL_PROJECTS[idx];

      if (found && !list.some((item) => item.id === found.id || item.slug === found.slug)) {
        list.push(found);
      }
    });

    // Ensure we always have 6
    liveList.forEach((p) => {
      if (list.length < 6 && !list.some((item) => item.id === p.id || item.slug === p.slug)) {
        list.push(p);
      }
    });

    return list.slice(0, 6);
  }, [projects]);

  // Additional projects beyond the 6 featured cards (for future added works)
  const additionalProjects = useMemo(() => {
    return projects.filter((p) => !featuredProjects.some((fp) => fp.slug === p.slug || (p.id && fp.id === p.id)));
  }, [projects, featuredProjects]);

  // The 6 featured items assigned to specific asymmetric positions:
  const p1 = featuredProjects[0]; // JCK Crypto Exchange (Left - Medium)
  const p2 = featuredProjects[1]; // Nifty Academy Platform (Center - Large/Tall)
  const p3 = featuredProjects[2]; // Creative Brand Identity (Right - Medium)
  const p4 = featuredProjects[3]; // YouTube Thumbnail Collection (Left - Medium)
  const p5 = featuredProjects[4]; // Modern Business Campaign (Right - Large/Tall)
  const p6 = featuredProjects[5]; // Social Media Design Collection (Left - Medium)

  // Navigation handlers for modal
  const currentList = activeCategory === 'All' ? [...featuredProjects, ...additionalProjects] : filteredProjects;
  const currentIndex = selectedProject
    ? currentList.findIndex((p) => (p.id && p.id === selectedProject.id) || p.slug === selectedProject.slug)
    : -1;

  const handleNavigate = (step: number) => {
    if (currentIndex === -1 || currentList.length === 0) return;
    const nextIdx = (currentIndex + step + currentList.length) % currentList.length;
    setSelectedProject(currentList[nextIdx]);
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

      {/* =========================================================================
          VIEW 1: DEFAULT "ALL" VIEW — EXACT 6 FEATURED ASYMMETRIC MASONRY
          ========================================================================= */}
      {activeCategory === 'All' ? (
        <div className="mt-14">
          {/* DESKTOP: 3-COLUMN ASYMMETRIC MASONRY LAYOUT */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-7 items-stretch">
            {/* LEFT COLUMN: 3 Medium Cards */}
            <div className="flex flex-col gap-7">
              {p1 && (
                <ProjectCard
                  project={p1}
                  onClick={() => setSelectedProject(p1)}
                  className="h-[270px] min-h-[270px]"
                />
              )}
              {p4 && (
                <ProjectCard
                  project={p4}
                  onClick={() => setSelectedProject(p4)}
                  className="h-[270px] min-h-[270px]"
                />
              )}
              {p6 && (
                <ProjectCard
                  project={p6}
                  onClick={() => setSelectedProject(p6)}
                  className="h-[270px] min-h-[270px]"
                />
              )}
            </div>

            {/* CENTER COLUMN: 1 Large/Tall Featured Card */}
            <div className="flex flex-col">
              {p2 && (
                <ProjectCard
                  project={p2}
                  onClick={() => setSelectedProject(p2)}
                  isLarge
                  className="h-full min-h-[858px] flex-1"
                />
              )}
            </div>

            {/* RIGHT COLUMN: 1 Medium Card + 1 Large/Tall Card */}
            <div className="flex flex-col gap-7">
              {p3 && (
                <ProjectCard
                  project={p3}
                  onClick={() => setSelectedProject(p3)}
                  className="h-[270px] min-h-[270px]"
                />
              )}
              {p5 && (
                <ProjectCard
                  project={p5}
                  onClick={() => setSelectedProject(p5)}
                  isLarge
                  className="h-[561px] min-h-[561px] flex-1"
                />
              )}
            </div>
          </div>

          {/* TABLET: 2-COLUMN BALANCED MASONRY LAYOUT */}
          <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6">
            <div className="flex flex-col gap-6">
              {p1 && (
                <ProjectCard
                  project={p1}
                  onClick={() => setSelectedProject(p1)}
                  className="min-h-[300px]"
                />
              )}
              {p2 && (
                <ProjectCard
                  project={p2}
                  onClick={() => setSelectedProject(p2)}
                  isLarge
                  className="min-h-[500px]"
                />
              )}
              {p6 && (
                <ProjectCard
                  project={p6}
                  onClick={() => setSelectedProject(p6)}
                  className="min-h-[300px]"
                />
              )}
            </div>

            <div className="flex flex-col gap-6">
              {p3 && (
                <ProjectCard
                  project={p3}
                  onClick={() => setSelectedProject(p3)}
                  className="min-h-[300px]"
                />
              )}
              {p4 && (
                <ProjectCard
                  project={p4}
                  onClick={() => setSelectedProject(p4)}
                  className="min-h-[300px]"
                />
              )}
              {p5 && (
                <ProjectCard
                  project={p5}
                  onClick={() => setSelectedProject(p5)}
                  isLarge
                  className="min-h-[500px]"
                />
              )}
            </div>
          </div>

          {/* MOBILE: SINGLE COLUMN VERTICAL STACK */}
          <div className="grid grid-cols-1 md:hidden gap-5">
            {[p1, p2, p3, p4, p5, p6].filter(Boolean).map((proj, idx) => (
              <ProjectCard
                key={proj.slug || idx}
                project={proj}
                onClick={() => setSelectedProject(proj)}
                isLarge={proj.slug === 'nifty-academy' || proj.slug === 'modern-business-campaign'}
                className={
                  proj.slug === 'nifty-academy' || proj.slug === 'modern-business-campaign'
                    ? 'min-h-[420px]'
                    : 'min-h-[330px]'
                }
              />
            ))}
          </div>

          {/* ADDITIONAL PUBLISHED PROJECTS (Appears if user adds more projects) */}
          {additionalProjects.length > 0 && (
            <div className="mt-14 pt-10 border-t border-border/60">
              <div className="mb-8">
                <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  More <span className="text-gradient">Design Projects</span>
                </h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-7">
                {additionalProjects.map((project, idx) => (
                  <Reveal key={project.id || project.slug || idx} delay={(idx % 3) * 80}>
                    <ProjectCard
                      project={project}
                      onClick={() => setSelectedProject(project)}
                      isLarge={project.shape === 'tall'}
                      className={project.shape === 'tall' ? 'min-h-[480px]' : 'min-h-[360px]'}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: CATEGORY FILTER VIEW (Branding, Social Media, Thumbnails, etc.)
            ========================================================================= */
        <div className="mt-14">
          {filteredProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No projects currently found in this category.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Showing {filteredProjects.length} {activeCategory} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
                </span>
                {onNavigateCategory && (
                  <button
                    type="button"
                    onClick={() => onNavigateCategory(toCategorySlug(activeCategory))}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    Open dedicated {activeCategory} page &rarr;
                  </button>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-7">
                {filteredProjects.map((project, idx) => (
                  <Reveal key={project.id || project.slug || idx} delay={(idx % 3) * 80}>
                    <ProjectCard
                      project={project}
                      onClick={() => setSelectedProject(project)}
                      isLarge={project.shape === 'tall'}
                      className={project.shape === 'tall' ? 'min-h-[480px]' : 'min-h-[360px]'}
                    />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Case Study Modal Dialog */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onPrev={() => handleNavigate(-1)}
          onNext={() => handleNavigate(1)}
        />
      )}
    </section>
  );
}



