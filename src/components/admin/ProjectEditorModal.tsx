import React, { useEffect, useState } from 'react';
import { Check, Eye, Loader2, Plus, Sparkles, X } from 'lucide-react';
import { Category, Project } from '../../types';
import { apiCreateProject, apiUpdateProject } from '../../lib/api';
import { APPROVED_PROJECT_CATEGORIES } from '../../data/siteData';
import { GalleryUploader, SingleImageUploader } from './ImageUploader';

interface ProjectEditorModalProps {
  project?: Project | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (savedProject: Project, successMessage?: string) => void;
  onRefreshCategories?: () => void;
}

const getInitialCategory = (raw?: string) => {
  if (!raw) return 'Branding';
  if (raw === 'Advertising') return 'Branding';
  if (raw === 'Video / Motion' || raw === 'Video' || raw === 'Motion') return 'Thumbnails';
  return (APPROVED_PROJECT_CATEGORIES as readonly string[]).includes(raw) ? raw : 'Branding';
};

const COMMON_TOOLS = [
  'Photoshop',
  'Illustrator',
  'Figma',
  'After Effects',
  'Premiere Pro',
  'Canva',
  'InDesign',
  'Blender',
  'Lightroom',
];

const COMMON_SERVICES = [
  'Brand Identity',
  'Social Media Design',
  'YouTube Thumbnails',
  'T-Shirt Design',
  'UI/UX Design',
  'Print Design',
  'Poster & Flyer',
  'Logo Design',
  'Packaging',
];

export function ProjectEditorModal({
  project,
  categories,
  onClose,
  onSaved,
  onRefreshCategories,
}: ProjectEditorModalProps) {
  const isEdit = Boolean(project?.id || project?.slug);

  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [category, setCategory] = useState(getInitialCategory(project?.category));
  const [categoryLabel, setCategoryLabel] = useState(project?.categoryLabel || project?.category || 'Branding');
  const [client, setClient] = useState(project?.client || '');
  const [year, setYear] = useState(project?.year || new Date().getFullYear().toString());
  const [shortDescription, setShortDescription] = useState(project?.shortDescription || project?.description || '');
  const [description, setDescription] = useState(project?.description || '');
  const [objective, setObjective] = useState(project?.objective || '');
  const [process, setProcess] = useState(project?.process || '');
  const [challenge, setChallenge] = useState(project?.challenge || '');
  const [creativeDirection, setCreativeDirection] = useState(project?.creativeDirection || '');
  const [results, setResults] = useState(project?.results || '');
  const [tools, setTools] = useState<string[]>(project?.tools || ['Photoshop', 'Illustrator']);
  const [customTool, setCustomTool] = useState('');
  const [servicesProvided, setServicesProvided] = useState<string[]>(project?.servicesProvided || []);
  const [customService, setCustomService] = useState('');
  const [thumbnail, setThumbnail] = useState(project?.thumbnail || '');
  const [hero, setHero] = useState(project?.hero || '');
  const [gallery, setGallery] = useState<string[]>(project?.gallery || []);
  const [shape, setShape] = useState<'wide' | 'tall'>(project?.shape || 'wide');
  const [url, setUrl] = useState(project?.url || '');
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState(project?.published ?? true);
  const [displayOrder, setDisplayOrder] = useState(project?.displayOrder ?? 1);

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUploading = thumbnailUploading || heroUploading || galleryUploading;

  // Auto-generate slug from title if new
  useEffect(() => {
    if (!isEdit && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  }, [title, isEdit]);

  // Sync categoryLabel default with category
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (!categoryLabel || categoryLabel === category) {
      setCategoryLabel(newCat);
    }
  };

  const toggleTool = (t: string) => {
    if (tools.includes(t)) {
      setTools(tools.filter((item) => item !== t));
    } else {
      setTools([...tools, t]);
    }
  };

  const addCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTool.trim() && !tools.includes(customTool.trim())) {
      setTools([...tools, customTool.trim()]);
      setCustomTool('');
    }
  };

  const toggleService = (s: string) => {
    if (servicesProvided.includes(s)) {
      setServicesProvided(servicesProvided.filter((item) => item !== s));
    } else {
      setServicesProvided([...servicesProvided, s]);
    }
  };

  const addCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (customService.trim() && !servicesProvided.includes(customService.trim())) {
      setServicesProvided([...servicesProvided, customService.trim()]);
      setCustomService('');
    }
  };

  const handleSave = async (publishStatus?: boolean) => {
    setError(null);
    const effectivePublished = publishStatus !== undefined ? publishStatus : published;

    if (isUploading) {
      setError('Please wait for the image upload to finish before saving.');
      return;
    }

    // Strict validation: Required fields
    if (!thumbnail && !hero && gallery.length === 0) {
      setError('Please upload a project image.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a project title.');
      return;
    }
    if (!category || !category.trim()) {
      setError('Please select a category.');
      return;
    }

    const finalThumb = thumbnail || (isEdit ? (project?.thumbnail || '') : (hero || gallery[0] || ''));
    const finalHero = hero || (isEdit ? (project?.hero || '') : (thumbnail || gallery[0] || ''));
    const finalGallery = gallery.length > 0 ? gallery : (finalHero ? [finalHero] : []);

    setSaving(true);
    try {
      const payload: Partial<Project> = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        categoryLabel: categoryLabel || category,
        client: client.trim() || 'Client',
        year: year.trim() || new Date().getFullYear().toString(),
        shortDescription: shortDescription.trim() || description.trim(),
        description: description.trim() || shortDescription.trim(),
        objective: objective.trim(),
        process: process.trim(),
        challenge: challenge.trim(),
        creativeDirection: creativeDirection.trim(),
        results: results.trim(),
        tools: tools.length > 0 ? tools : ['Photoshop', 'Illustrator'],
        servicesProvided,
        thumbnail: finalThumb,
        hero: finalHero,
        gallery: finalGallery,
        shape,
        url: url.trim(),
        featured,
        published: effectivePublished,
        displayOrder: Number(displayOrder) || 1,
      };

      let saved: Project;
      let message = 'Project saved successfully.';
      if (isEdit && (project?.id || project?.slug)) {
        const idToUpdate = project.id || project.slug;
        saved = await apiUpdateProject(idToUpdate, payload);
        message = effectivePublished
          ? 'Project updated and published successfully.'
          : 'Project updated and saved as draft.';
      } else {
        saved = await apiCreateProject(payload);
        message = effectivePublished
          ? 'Project updated and published successfully.'
          : 'Draft saved successfully.';
      }

      onSaved(saved, message);
      onClose();
    } catch (err: any) {
      console.error('Project save error:', err);
      setError(err.message || 'Failed to update project. Please check fields and retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-background/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[2rem] border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-surface/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {isEdit ? `Edit Project: ${project?.title}` : 'Add New Portfolio Project'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload designs, enter case study details and publish live to portfolio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/15 p-4 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Section 1: Core Essentials */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Project Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. JCK Crypto Exchange Branding"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none cursor-pointer"
              >
                {APPROVED_PROJECT_CATEGORIES.map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Category Subtitle / Badge
              </label>
              <input
                type="text"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                placeholder="e.g. Brand & Social Media"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Client / Brand Name
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. JCK Exchange / Personal Creator"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Image Uploads */}
          <div className="border-t border-border/80 pt-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> Design Visuals & Artwork
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Primary Thumbnail */}
              <SingleImageUploader
                label="Portfolio Card Thumbnail"
                description="Shown on the main portfolio grid."
                value={thumbnail}
                onChange={(url) => {
                  setThumbnail(url);
                  if (!isEdit && url && !hero) {
                    setHero(url);
                  }
                }}
                onUploadingChange={setThumbnailUploading}
                aspect="video"
                required
              />

              {/* Case Study Hero */}
              <SingleImageUploader
                label="Case Study Hero Visual"
                description="Large header graphic in the project modal view."
                value={hero}
                onChange={(url) => {
                  setHero(url);
                  if (!isEdit && url && !thumbnail) {
                    setThumbnail(url);
                  }
                }}
                onUploadingChange={setHeroUploading}
                aspect="video"
              />
            </div>

            {/* Gallery Multi-Uploader */}
            <div className="pt-2">
              <GalleryUploader
                images={gallery}
                onChange={setGallery}
                onUploadingChange={setGalleryUploading}
                currentThumbnail={thumbnail}
                onSetThumbnail={(url) => setThumbnail(url)}
              />
            </div>
          </div>

          {/* Section 3: Descriptions & Case Study Details */}
          <div className="border-t border-border/80 pt-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Project Case Study Content</h3>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Short Description (Hover Summary)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief 1-2 sentence overview shown on hover"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Full Description / Project Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive narrative of the project context, design strategy, and delivery..."
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none resize-y"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Design Objective
                </label>
                <textarea
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="What problem were you solving for the client?"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none resize-y"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Creative Process
                </label>
                <textarea
                  rows={3}
                  value={process}
                  onChange={(e) => setProcess(e.target.value)}
                  placeholder="How did you research, draft, and refine the visuals?"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none resize-y"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Creative Direction & Visual Style
                </label>
                <input
                  type="text"
                  value={creativeDirection}
                  onChange={(e) => setCreativeDirection(e.target.value)}
                  placeholder="e.g. Glassmorphic dark palette with neon accents"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Outcome / Results
                </label>
                <input
                  type="text"
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  placeholder="e.g. +40% engagement, 1.2k active students enrolled"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Tools & Tags */}
          <div className="border-t border-border/80 pt-6 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground block mb-2">
                Tools Used ({tools.length})
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_TOOLS.map((t) => {
                  const selected = tools.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTool(t)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        selected
                          ? 'bg-accent text-accent-foreground shadow-xs'
                          : 'border border-border bg-surface/50 text-muted-foreground hover:border-accent/60 hover:text-foreground'
                      }`}
                    >
                      {selected && <Check className="inline h-3 w-3 mr-1" />} {t}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={customTool}
                  onChange={(e) => setCustomTool(e.target.value)}
                  placeholder="Add custom tool (e.g. Cinema 4D)"
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-accent"
                />
                <button
                  type="button"
                  onClick={addCustomTool}
                  className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground block mb-2">
                Services Provided
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_SERVICES.map((s) => {
                  const selected = servicesProvided.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-surface/50 text-muted-foreground hover:border-accent/60 hover:text-foreground'
                      }`}
                    >
                      {selected && <Check className="inline h-3 w-3 mr-1" />} {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Layout & Publishing Options */}
          <div className="border-t border-border/80 pt-6 grid gap-5 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Card Grid Shape
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as 'wide' | 'tall')}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                <option value="wide">Wide (Standard / Landscape)</option>
                <option value="tall">Tall (Portrait / High Contrast)</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Custom URL / External Link (Optional)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://behance.net/..."
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded accent-accent"
              />
              <span className="text-sm font-medium text-foreground">Featured Project (Highlight on top)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded accent-accent"
              />
              <span className="text-sm font-medium text-foreground">Published (Visible on Live Website)</span>
            </label>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/80 px-6 py-4 bg-surface/95">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-full border border-border px-6 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel / Discard
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={saving || isUploading}
              onClick={() => handleSave(false)}
              className="w-full sm:w-auto rounded-full border border-border bg-surface px-6 py-2.5 text-xs font-medium text-foreground hover:border-accent/60 disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={saving || isUploading}
              onClick={() => handleSave(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-7 py-2.5 text-xs font-medium text-accent-foreground shadow-md transition-transform hover:scale-102 disabled:opacity-50"
            >
              {saving ? (
                <>
                  {isEdit ? 'Updating...' : 'Publishing...'} <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </>
              ) : isUploading ? (
                <>
                  Uploading Design... <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </>
              ) : isEdit ? (
                'Update & Publish'
              ) : (
                'Publish to Website'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
