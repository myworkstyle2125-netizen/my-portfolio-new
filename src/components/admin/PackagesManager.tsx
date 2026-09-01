import React, { useState } from 'react';
import { Check, Edit, Package, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { PackageItem } from '../../types';
import { apiGetPackages, getAdminToken } from '../../lib/api';

interface PackagesManagerProps {
  packages: PackageItem[];
  onRefresh: () => void;
}

export function PackagesManager({ packages, onRefresh }: PackagesManagerProps) {
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [popular, setPopular] = useState(false);
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setEditingPkg(null);
    setName('');
    setPrice('Rs. 5,000 – Rs. 15,000');
    setDeliveryTime('2-3 Days');
    setDescription('');
    setFeaturesText('');
    setPopular(false);
    setIsAdding(true);
  };

  const startEdit = (pkg: PackageItem) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setPrice(pkg.price);
    setDeliveryTime(pkg.deliveryTime || '3 Days');
    setDescription(pkg.description);
    setFeaturesText(pkg.features.join('\n'));
    setPopular(Boolean(pkg.popular));
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        price: price.trim(),
        deliveryTime: deliveryTime.trim(),
        description: description.trim(),
        features,
        popular,
      };

      const token = getAdminToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (editingPkg) {
        await fetch(`/api/packages/${editingPkg.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/packages', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      setIsAdding(false);
      setEditingPkg(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this design package?')) return;
    try {
      const token = getAdminToken();
      await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Design Packages & Pricing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure client service tiers, pricing ranges, and scope deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={startAdd}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-md hover:scale-102 transition-transform"
        >
          <Plus className="h-4 w-4" /> Add Package
        </button>
      </div>

      {/* Inline Editor */}
      {(isAdding || editingPkg) && (
        <form onSubmit={handleSave} className="rounded-2xl border border-accent/40 bg-surface/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-accent" />
              {editingPkg ? `Edit Package: ${editingPkg.name}` : 'New Design Package'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingPkg(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1 sm:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Package Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brand & Social Suite"
                className="rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-accent"
              />
            </div>

            <div className="grid gap-1 sm:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Price / Range
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Rs. 15,000 – Rs. 35,000"
                className="rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-accent"
              />
            </div>

            <div className="grid gap-1 sm:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Turnaround Time
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="3-5 Days"
                className="rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-accent"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ideal for growing brands and businesses wanting high polish..."
              className="rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Deliverables & Features (One per line)
            </label>
            <textarea
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Logo files in AI, PNG, SVG&#10;Social Media Templates&#10;Brand Guidelines Sheet"
              className="rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="h-4 w-4 rounded accent-accent"
              />
              Mark as Popular / Recommended Choice
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingPkg(null);
                }}
                className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-accent px-5 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingPkg ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Package cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id || pkg.name}
            className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
              pkg.popular
                ? 'border-accent bg-surface shadow-lg'
                : 'border-border bg-surface hover:border-border/80'
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                <Sparkles className="h-3 w-3" /> Most Popular
              </span>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{pkg.name}</h3>
                <p className="text-lg font-bold text-accent mt-1">{pkg.price}</p>
                <p className="text-[0.68rem] text-muted-foreground mt-0.5">Delivery: {pkg.deliveryTime}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(pkg)}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pkg.id)}
                  className="p-1.5 rounded-lg border border-border text-destructive hover:bg-destructive/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{pkg.description}</p>

            <ul className="mt-5 space-y-2 border-t border-border/80 pt-4 flex-1">
              {pkg.features?.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
