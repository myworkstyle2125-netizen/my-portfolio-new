import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { Category, Project } from '../../types';
import {
  apiDeleteProject,
  apiDuplicateProject,
  apiToggleFeatured,
  apiTogglePublish,
} from '../../lib/api';
import { ProjectEditorModal } from './ProjectEditorModal';
import { ProjectModal } from '../ProjectModal';

interface ProjectsManagerProps {
  projects: Project[];
  categories: Category[];
  onRefresh: () => void;
  onRefreshCategories: () => void;
}

export function ProjectsManager({
  projects,
  categories,
  onRefresh,
  onRefreshCategories,
}: ProjectsManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');

  const [editingProject, setEditingProject] = useState<Project | null | undefined>(undefined);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesClient = p.client.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesTools = p.tools?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesClient && !matchesCat && !matchesTools) return false;
      }

      // Category filter
      if (selectedCat !== 'All' && p.category.toLowerCase() !== selectedCat.toLowerCase()) {
        return false;
      }

      // Status filter
      if (statusFilter === 'published' && p.published === false) return false;
      if (statusFilter === 'draft' && p.published !== false) return false;
      if (statusFilter === 'featured' && !p.featured) return false;

      return true;
    });
  }, [projects, search, selectedCat, statusFilter]);

  const handleTogglePublish = async (p: Project) => {
    try {
      const newStatus = !(p.published !== false);
      await apiTogglePublish(p.id || p.slug, newStatus);
      setFeedback(`Project "${p.title}" is now ${newStatus ? 'Published' : 'Draft'}.`);
      onRefresh();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleToggleFeatured = async (p: Project) => {
    try {
      const newFeatured = !p.featured;
      await apiToggleFeatured(p.id || p.slug, newFeatured);
      setFeedback(`Project "${p.title}" ${newFeatured ? 'marked as Featured' : 'unmarked from Featured'}.`);
      onRefresh();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured');
    }
  };

  const handleDuplicate = async (p: Project) => {
    try {
      await apiDuplicateProject(p.id || p.slug);
      setFeedback(`Duplicated "${p.title}" as a new Draft.`);
      onRefresh();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate project');
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await apiDeleteProject(projectToDelete.id || projectToDelete.slug);
      setFeedback(`Deleted project "${projectToDelete.title}".`);
      setProjectToDelete(null);
      onRefresh();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Portfolio Projects
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, upload, edit and publish design works to your live portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingProject(null)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-md transition-transform hover:scale-102"
        >
          <Plus className="h-4 w-4" /> Add New Project
        </button>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/15 px-4 py-3 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-3">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, client, category or tool..."
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status pill filters */}
          <div className="flex items-center gap-1 bg-surface rounded-xl border border-border p-1">
            {(['all', 'published', 'draft', 'featured'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-medium capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid / Table */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted-foreground mb-3">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No projects found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {search || selectedCat !== 'All' || statusFilter !== 'all'
              ? 'Try resetting your search filters to see all works.'
              : 'You have no portfolio projects yet. Click "+ Add New Project" to upload your first design.'}
          </p>
          <button
            type="button"
            onClick={() => setEditingProject(null)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Upload Design Image
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => {
            const isPublished = p.published !== false;
            return (
              <div
                key={p.id || p.slug}
                className="group relative flex flex-col rounded-[1.75rem] border border-border bg-surface shadow-lg overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface/80">
                  <img
                    src={p.thumbnail || p.hero || '/assets/work-jck.jpg'}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />

                  {/* Dark gradient overlay matching live site */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />

                  {/* Status Badges on Thumbnail */}
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider backdrop-blur-md border ${
                        isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-xs'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-xs'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      {isPublished ? 'Published' : 'Draft'}
                    </span>

                    {p.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-accent px-3 py-0.5 text-[0.65rem] font-semibold text-accent-foreground shadow-xs">
                        <Sparkles className="h-2.5 w-2.5" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Top Right Star Toggle */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 z-10">
                    <button
                      type="button"
                      title={p.featured ? 'Remove Featured' : 'Mark as Featured'}
                      onClick={() => handleToggleFeatured(p)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 ${
                        p.featured
                          ? 'bg-accent text-accent-foreground border-accent shadow-md scale-105'
                          : 'bg-background/70 text-muted-foreground border-border/80 hover:text-accent hover:border-accent hover:bg-background'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Category & Order Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                    <span className="text-[0.68rem] uppercase tracking-[0.22em] font-semibold text-accent drop-shadow-md">
                      {p.categoryLabel || p.category} {p.year ? `· ${p.year}` : ''}
                    </span>
                    <span className="text-[0.68rem] text-muted-foreground bg-background/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border/50">
                      Order: #{p.displayOrder ?? '-'}
                    </span>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-accent transition-colors truncate">
                      {p.title}
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Client: <span className="text-foreground font-medium">{p.client || 'Personal'}</span>
                  </p>

                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {p.shortDescription || p.description}
                  </p>

                  {/* Tools preview badges */}
                  {p.tools && p.tools.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {p.tools.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-lg border border-border/80 bg-background/60 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      {p.tools.length > 4 && (
                        <span className="rounded-lg border border-border/60 bg-background/40 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                          +{p.tools.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Row with matching live styling */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/70">
                    {/* Live preview modal button */}
                    <button
                      type="button"
                      onClick={() => setPreviewProject(p)}
                      title="Preview Case Study Modal"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors hover:text-accent group/btn"
                    >
                      <Eye className="h-3.5 w-3.5 text-accent transition-transform group-hover/btn:scale-110" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Publish / Draft Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(p)}
                        title={isPublished ? 'Switch to Draft' : 'Publish to Live Site'}
                        className={`rounded-xl px-2.5 py-1 text-[0.68rem] font-semibold border transition-all duration-200 ${
                          isPublished
                            ? 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface/80'
                            : 'border-accent bg-accent/15 text-accent hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {isPublished ? 'Unpublish' : 'Publish'}
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(p)}
                        title="Duplicate as draft"
                        className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface hover:border-accent/40 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => setEditingProject(p)}
                        title="Edit Project"
                        className="rounded-xl border border-border p-1.5 text-accent hover:bg-accent/15 hover:border-accent/50 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(p)}
                        title="Delete Project"
                        className="rounded-xl border border-border p-1.5 text-destructive hover:bg-destructive/15 hover:border-destructive/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Add Modal */}
      {editingProject !== undefined && (
        <ProjectEditorModal
          project={editingProject}
          categories={categories}
          onClose={() => setEditingProject(undefined)}
          onRefreshCategories={onRefreshCategories}
          onSaved={() => {
            onRefresh();
            setFeedback('Project saved successfully!');
            setTimeout(() => setFeedback(null), 3000);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Delete Project?</h3>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">"{projectToDelete.title}"</strong>? This will remove
              it from your portfolio website.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-full bg-destructive px-5 py-2 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Study Live Preview */}
      {previewProject && (
        <ProjectModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
          onPrev={() => {}}
          onNext={() => {}}
        />
      )}
    </div>
  );
}
