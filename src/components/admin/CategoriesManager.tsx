import React, { useState } from 'react';
import { Edit, FolderPlus, Layers, X } from 'lucide-react';
import { Category, Project } from '../../types';
import { apiUpdateCategory } from '../../lib/api';
import { APPROVED_PROJECT_CATEGORIES } from '../../data/siteData';

interface CategoriesManagerProps {
  categories: Category[];
  projects: Project[];
  onRefresh: () => void;
}

export function CategoriesManager({ categories, projects, onRefresh }: CategoriesManagerProps) {
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayCategories = APPROVED_PROJECT_CATEGORIES.map((catName) => {
    const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    return found || {
      id: `cat-${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: catName,
      slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: '',
      displayOrder: 1,
      published: true,
    };
  });

  const startEdit = (c: Category) => {
    setEditingCat(c);
    setDescription(c.description || '');
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;

    setSaving(true);
    try {
      await apiUpdateCategory(editingCat.id, { name: editingCat.name, description: description.trim() });
      setEditingCat(null);
      setDescription('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Portfolio Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize the 6 core design disciplines and filter tabs on your public portfolio.
          </p>
        </div>
      </div>

      {/* Inline Edit Form */}
      {editingCat && (
        <form onSubmit={handleSave} className="rounded-2xl border border-accent/40 bg-surface/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-accent" />
              Edit Category: {editingCat.name}
            </h3>
            <button
              type="button"
              onClick={() => setEditingCat(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category Name (Fixed)
              </label>
              <input
                type="text"
                disabled
                value={editingCat.name}
                className="rounded-xl border border-input bg-surface px-4 py-2 text-xs text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description / Purpose
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the work in this category"
                className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingCat(null)}
              className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-accent px-5 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Update Category'}
            </button>
          </div>
        </form>
      )}

      {/* 6 Categories List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayCategories.map((c) => {
          const count = projects.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length;
          return (
            <div
              key={c.id || c.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border text-accent">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                    <span className="text-[0.68rem] text-muted-foreground">{count} projects published</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
                    title="Edit category details"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {c.description && (
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  {c.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
