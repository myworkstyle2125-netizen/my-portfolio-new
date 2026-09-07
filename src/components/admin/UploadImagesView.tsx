import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileImage,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Category, Project } from '../../types';
import { apiCreateProject, apiUploadFiles, apiUploadSingle } from '../../lib/api';
import { APPROVED_PROJECT_CATEGORIES, toCategorySlug } from '../../lib/categories';
import { validateImageFile } from '../../lib/imageUtils';

interface UploadImagesViewProps {
  categories: Category[];
  onProjectCreated: (newProject: Project) => void;
  onNavigateToPortfolio: (filter?: 'all' | 'published' | 'draft') => void;
}

const COMMON_TOOLS = [
  'Photoshop',
  'Illustrator',
  'Figma',
  'Premiere Pro',
  'After Effects',
  'Canva',
  'InDesign',
  'Blender',
];

export function UploadImagesView({
  categories,
  onProjectCreated,
  onNavigateToPortfolio,
}: UploadImagesViewProps) {
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Branding');
  const [client, setClient] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState('');
  const [tools, setTools] = useState<string[]>(['Photoshop', 'Illustrator']);
  const [customTool, setCustomTool] = useState('');
  const [shape, setShape] = useState<'wide' | 'tall'>('wide');
  const [featured, setFeatured] = useState(false);

  // Uploaded images state
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ project: Project; published: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Validate images
    const invalidFiles = fileArray.filter((f) => !validateImageFile(f).valid);
    if (invalidFiles.length > 0) {
      setUploadError('Please select valid image files (JPG, PNG, WebP, SVG, AVIF).');
      return;
    }

    setUploadError(null);
    setUploading(true);
    setUploadProgress(15);

    try {
      let newUrls: string[] = [];
      if (fileArray.length === 1) {
        setUploadProgress(40);
        const url = await apiUploadSingle(fileArray[0]);
        setUploadProgress(90);
        newUrls = [url];
      } else {
        setUploadProgress(30);
        newUrls = await apiUploadFiles(fileArray);
        setUploadProgress(95);
      }

      setUploadedUrls((prev) => [...prev, ...newUrls]);

      // If title is empty, pre-populate title from the first file name
      if (!title.trim() && fileArray[0]) {
        const rawName = fileArray[0].name.replace(/\.[^/.]+$/, '');
        const formattedTitle = rawName
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();
        if (formattedTitle) {
          setTitle(formattedTitle);
        }
      }

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 800);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Image upload failed. Please click retry or select another file.');
      setUploadProgress(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleToggleTool = (tool: string) => {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleAddCustomTool = () => {
    if (customTool.trim() && !tools.includes(customTool.trim())) {
      setTools((prev) => [...prev, customTool.trim()]);
      setCustomTool('');
    }
  };

  const handleSave = async (publishNow: boolean) => {
    if (!title.trim()) {
      setUploadError('Please provide a project title.');
      return;
    }

    if (uploadedUrls.length === 0) {
      setUploadError('Please upload at least one image for the portfolio item.');
      return;
    }

    setUploadError(null);
    setSaving(true);

    try {
      const primaryImage = uploadedUrls[0];
      const galleryImages = uploadedUrls;

      const newProjectData: Partial<Project> = {
        title: title.trim(),
        category,
        categoryLabel: category,
        client: client.trim() || 'Assorted Brands',
        year: year.trim() || new Date().getFullYear().toString(),
        shortDescription: description.trim(),
        description: description.trim(),
        thumbnail: primaryImage,
        hero: primaryImage,
        gallery: galleryImages,
        tools: tools.length > 0 ? tools : ['Photoshop', 'Illustrator'],
        shape,
        featured,
        published: publishNow,
      };

      const created = await apiCreateProject(newProjectData);
      onProjectCreated(created);
      setSuccessResult({ project: created, published: publishNow });
    } catch (err: any) {
      console.error('Error saving portfolio item:', err);
      setUploadError(err.message || 'Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Branding');
    setClient('');
    setYear(new Date().getFullYear().toString());
    setDescription('');
    setTools(['Photoshop', 'Illustrator']);
    setShape('wide');
    setFeatured(false);
    setUploadedUrls([]);
    setUploadError(null);
    setSuccessResult(null);
  };

  // Success view
  if (successResult) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-8 sm:p-12 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <span className="text-[0.68rem] uppercase tracking-[0.24em] font-semibold text-accent">
          {successResult.published ? 'Published to Website' : 'Saved as Draft'}
        </span>

        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-foreground">
          {successResult.project.title}
        </h2>

        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          {successResult.published
            ? 'Your portfolio image is permanently saved in cloud storage and now instantly visible to every visitor on the public website!'
            : 'Saved safely in your drafts. You can review, refine, and publish it whenever you are ready.'}
        </p>

        {/* Thumbnail Preview */}
        {successResult.project.thumbnail && (
          <div className="mt-6 mx-auto max-w-md overflow-hidden rounded-2xl border border-border/80 shadow-md">
            <img
              src={successResult.project.thumbnail}
              alt={successResult.project.title}
              className="h-56 w-full object-cover"
            />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-2.5 text-xs font-semibold text-accent-foreground shadow-md transition-transform hover:scale-102"
          >
            <Plus className="h-4 w-4" /> Upload Another Image
          </button>

          <button
            type="button"
            onClick={() => onNavigateToPortfolio(successResult.published ? 'published' : 'draft')}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-2.5 text-xs font-medium text-foreground hover:border-accent transition-colors"
          >
            <Layers className="h-4 w-4" /> View in Portfolio List
          </button>

          {successResult.published && (
            <a
              href={`/?cat=${toCategorySlug(successResult.project.category)}#portfolio`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-2.5 text-xs font-medium text-accent hover:underline transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> View on Public Site
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <span className="text-[0.68rem] uppercase tracking-[0.24em] font-semibold text-accent">
          Permanent Cloud Storage
        </span>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Upload Portfolio Images
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Upload your high-resolution design works directly from your computer or phone. Choose a category, add details, and publish directly to the live website.
        </p>
      </div>

      {uploadError && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload Notice</p>
            <p className="mt-1 text-xs">{uploadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-destructive/80 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="rounded-3xl border border-border bg-surface/90 p-6 sm:p-8 shadow-md">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground block mb-3">
          1. Select or Drop Images (JPG, PNG, WebP)
        </label>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-accent bg-accent/10 scale-[1.01]'
              : 'border-border/80 bg-background/50 hover:border-accent/60 hover:bg-background/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif"
            onChange={(e) => {
              if (e.target.files) handleFilesUpload(e.target.files);
            }}
            className="hidden"
          />

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/20">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <UploadCloud className="h-8 w-8" />
            )}
          </div>

          <p className="font-display font-semibold text-base sm:text-lg text-foreground">
            {uploading ? 'Processing & Uploading Image...' : 'Click to Browse or Drag & Drop'}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-sm">
            High quality JPG, PNG, or WebP. Images are automatically optimized and securely saved to cloud storage.
          </p>

          {uploadProgress !== null && (
            <div className="mt-4 w-full max-w-xs">
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full bg-gradient-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="mt-1 block text-right text-[0.65rem] text-muted-foreground font-mono">
                {uploadProgress}%
              </span>
            </div>
          )}
        </div>

        {/* Uploaded Previews */}
        {uploadedUrls.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Uploaded Assets ({uploadedUrls.length})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add more views
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {uploadedUrls.map((url, idx) => (
                <div
                  key={url}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm"
                >
                  <img
                    src={url}
                    alt={`Uploaded ${idx + 1}`}
                    className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="rounded-full bg-destructive/90 p-2 text-destructive-foreground hover:bg-destructive shadow-md"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-accent/90 px-2 py-0.5 text-[0.65rem] font-semibold text-accent-foreground shadow-xs">
                      Main Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metadata & Details */}
      <div className="rounded-3xl border border-border bg-surface/90 p-6 sm:p-8 shadow-md space-y-6">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground block">
          2. Portfolio Details & Category
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Project Title */}
          <div className="grid gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Project Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern YouTube Gaming Thumbnail"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Portfolio Category <span className="text-destructive">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {APPROVED_PROJECT_CATEGORIES.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
          </div>

          {/* Client Name */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Client / Brand Name (Optional)
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Apex Digital or Personal Project"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          {/* Year */}
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

          {/* Shape Layout */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Card Shape
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as 'wide' | 'tall')}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              <option value="wide">Wide / Landscape (Thumbnails, Banners, Socials)</option>
              <option value="tall">Tall / Portrait (T-Shirts, Posters, Mobile UI)</option>
            </select>
          </div>

          {/* Description */}
          <div className="grid gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Short Description / Design Objective (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the creative concept, visual style, or outcome of this design..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none resize-y"
            />
          </div>

          {/* Tools Used Chips */}
          <div className="grid gap-2 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tools Used
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TOOLS.map((tool) => {
                const isSelected = tools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => handleToggleTool(tool)}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-accent text-accent-foreground font-semibold shadow-xs'
                        : 'border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-accent/50'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {tool}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 max-w-xs mt-1">
              <input
                type="text"
                value={customTool}
                onChange={(e) => setCustomTool(e.target.value)}
                placeholder="Add other tool..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAddCustomTool}
                className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent"
              >
                Add
              </button>
            </div>
          </div>

          {/* Featured Option */}
          <div className="sm:col-span-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded accent-accent"
              />
              <span className="text-sm font-medium text-foreground">
                Highlight as Featured Project on Homepage
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-border bg-surface/90 p-6 shadow-md">
        <div>
          <p className="text-xs font-semibold text-foreground">Ready to Save?</p>
          <p className="text-xs text-muted-foreground">
            Save as draft to preview privately, or publish to make it visible to all visitors.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => handleSave(false)}
            className="w-full sm:w-auto rounded-full border border-border bg-background px-6 py-2.5 text-xs font-medium text-foreground hover:border-accent/60 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => handleSave(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-8 py-2.5 text-xs font-semibold text-accent-foreground shadow-md transition-transform hover:scale-102 disabled:opacity-50"
          >
            {saving ? (
              <>
                Publishing... <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Publish to Website
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
