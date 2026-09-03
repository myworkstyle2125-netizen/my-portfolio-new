import React, { useRef, useState, useEffect } from 'react';
import { Check, Image as ImageIcon, Loader2, RefreshCw, Trash2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { apiUploadFiles, apiUploadSingle } from '../../lib/api';
import { validateImageFile } from '../../lib/imageUtils';

interface SingleImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  description?: string;
  aspect?: 'video' | 'square' | 'auto';
  required?: boolean;
}

export function SingleImageUploader({
  label,
  value,
  onChange,
  onUploadingChange,
  description,
  aspect = 'video',
  required = false,
}: SingleImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep localPreview in sync or null when value changes from outside
  useEffect(() => {
    if (!value) {
      setLocalPreview(null);
    }
  }, [value]);

  const handleFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Please choose a valid image file (JPG, PNG, WEBP, SVG).');
      return;
    }

    setError(null);
    setUploading(true);
    onUploadingChange?.(true);

    // Instant local preview
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);

    try {
      const serverUrl = await apiUploadSingle(file);
      onChange(serverUrl);
      setLocalPreview(null);
    } catch (err: any) {
      console.error('Single image upload failed:', err);
      setError(err.message || 'Image upload failed. Please try again.');
      // Revert preview if no persistent value exists
      if (!value) {
        setLocalPreview(null);
      }
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowUrlInput(false);
      setManualUrl('');
      setError(null);
    }
  };

  const displayImage = localPreview || value;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {!showUrlInput && (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LinkIcon className="h-3 w-3" /> Paste URL
            </button>
          )}
          {displayImage && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setLocalPreview(null);
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {showUrlInput && (
        <form onSubmit={handleManualUrlSubmit} className="flex items-center gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or /uploads/..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-hidden"
          />
          <button
            type="submit"
            className="rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setManualUrl('');
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </form>
      )}

      {displayImage ? (
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-surface/50">
          <img
            src={displayImage}
            alt={label}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-102 ${
              aspect === 'video' ? 'aspect-[16/10]' : aspect === 'square' ? 'aspect-square' : 'max-h-80'
            }`}
          />

          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 backdrop-blur-xs">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
              <p className="text-xs font-medium text-foreground">Saving image to persistent storage…</p>
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-transform hover:scale-105"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replace Image
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setLocalPreview(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive/90 px-4 py-2 text-xs font-medium text-white transition-transform hover:scale-105"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-accent bg-accent/10'
              : 'border-border/80 bg-surface/30 hover:border-accent/60 hover:bg-surface/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-xs font-medium text-foreground">Uploading image from computer…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border text-accent">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Click to browse or drag & drop design file
              </p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WEBP up to 30MB (Preserves full original quality)</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}

// ----------------------------------------------------
// MULTI-GALLERY IMAGE UPLOADER
// ----------------------------------------------------
interface GalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onSetThumbnail?: (url: string) => void;
  currentThumbnail?: string;
}

export function GalleryUploader({
  images,
  onChange,
  onUploadingChange,
  onSetThumbnail,
  currentThumbnail,
}: GalleryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files);
    const validFiles = rawFiles.filter((f) => validateImageFile(f).valid);
    const invalidFiles = rawFiles.filter((f) => !validateImageFile(f).valid);

    if (!validFiles.length) {
      const firstError = invalidFiles[0] ? validateImageFile(invalidFiles[0]).error : null;
      setError(firstError || 'Please select valid image files (JPG, PNG, WEBP, SVG).');
      return;
    }

    if (invalidFiles.length > 0) {
      setError(`Skipped ${invalidFiles.length} file(s) that were not valid image formats.`);
    } else {
      setError(null);
    }

    setUploading(true);
    setUploadProgress({ completed: 0, total: validFiles.length });
    onUploadingChange?.(true);

    try {
      const urls = await apiUploadFiles(validFiles, (completed, total) => {
        setUploadProgress({ completed, total });
      });

      if (urls.length > 0) {
        // Append all uploaded images without removing any existing ones
        onChange([...images, ...urls]);
        if (urls.length < validFiles.length) {
          setError(`Uploaded ${urls.length} of ${validFiles.length} images. Some files encountered errors and were skipped.`);
        }
      }
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      setError(err.message || 'Gallery upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      onUploadingChange?.(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Project Gallery Visuals ({images.length})
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add multiple detail shots, mockups, color palettes or variations to display in the case study modal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/60"
        >
          <UploadCloud className="h-3.5 w-3.5 text-accent" /> Add Images
        </button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((imgUrl, idx) => {
            const isThumb = currentThumbnail === imgUrl;
            return (
              <div
                key={`${imgUrl}-${idx}`}
                className="group relative aspect-[16/11] overflow-hidden rounded-xl border border-border bg-surface"
              >
                <img src={imgUrl} alt={`Gallery item ${idx + 1}`} className="h-full w-full object-cover" />

                {/* Badge if thumbnail */}
                {isThumb && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold text-accent-foreground">
                    <Check className="h-2.5 w-2.5" /> Thumbnail
                  </span>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-xs">
                  {onSetThumbnail && !isThumb && (
                    <button
                      type="button"
                      onClick={() => onSetThumbnail(imgUrl)}
                      className="rounded-full bg-surface border border-border px-2.5 py-1 text-[0.68rem] font-medium text-foreground hover:border-accent"
                    >
                      Set Thumbnail
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="inline-flex items-center gap-1 rounded-full bg-destructive/90 px-2.5 py-1 text-[0.68rem] font-medium text-white hover:bg-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-accent bg-accent/10'
            : 'border-border/80 bg-surface/20 hover:border-accent/60 hover:bg-surface/40'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <Loader2 className="h-7 w-7 animate-spin text-accent" />
            <p className="text-xs font-medium text-foreground">
              {uploadProgress
                ? `Uploading gallery design files (${uploadProgress.completed}/${uploadProgress.total})…`
                : 'Uploading gallery design files…'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-accent">
              <ImageIcon className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-foreground">
              Drop multiple design images here or click to browse
            </p>
            <p className="text-[0.7rem] text-muted-foreground">Select multiple JPG, PNG, WEBP files at once</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
        }}
      />
    </div>
  );
}
