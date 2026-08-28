import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Filter,
  MessageSquare,
  Plus,
  Search,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Testimonial } from '../../types';
import {
  apiDeleteTestimonial,
  apiSubmitTestimonial,
  apiUpdateTestimonialStatus,
} from '../../lib/api';

interface ReviewsManagerProps {
  testimonials: Testimonial[];
  onRefresh: () => void;
}

export function ReviewsManager({ testimonials, onRefresh }: ReviewsManagerProps) {
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New review form
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);

  const filtered = testimonials.filter((t) => {
    if (filter === 'approved' && t.status !== 'approved' && t.status !== undefined) return false;
    if (filter === 'pending' && t.status !== 'pending') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchRole = (t.role || '').toLowerCase().includes(q);
      const matchQuote = t.quote.toLowerCase().includes(q);
      return matchName || matchRole || matchQuote;
    }
    return true;
  });

  const totalReviews = testimonials.length;
  const approvedCount = testimonials.filter((t) => t.status === 'approved' || !t.status).length;
  const pendingCount = testimonials.filter((t) => t.status === 'pending').length;
  const avgRating = totalReviews > 0
    ? (
        testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / totalReviews
      ).toFixed(1)
    : '5.0';

  const handleToggleStatus = async (t: Testimonial) => {
    try {
      const newStatus = t.status === 'approved' || !t.status ? 'pending' : 'approved';
      if (t.id) {
        await apiUpdateTestimonialStatus(t.id, newStatus);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await apiDeleteTestimonial(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    try {
      setIsSubmitting(true);
      await apiSubmitTestimonial({
        name: name.trim(),
        role: role.trim() || 'Verified Client',
        quote: quote.trim(),
        rating,
        status: 'approved',
      });
      setIsModalOpen(false);
      setName('');
      setRole('');
      setQuote('');
      setRating(5);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Reviews & Testimonials
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage client feedback, ratings, and testimonials displayed on your homepage.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Manual Review
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
            Average Rating
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">{avgRating}</span>
            <div className="flex text-accent">
              <Star className="h-4 w-4 fill-accent" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
            Total Feedback
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">{totalReviews}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
            Approved & Live
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{approvedCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
            Pending Approval
          </p>
          <p className="mt-1 text-xl font-bold text-amber-400">{pendingCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1 self-start">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({totalReviews})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'approved'
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by name or text..."
            className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted-foreground mb-3">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No reviews found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? 'No testimonials matched your search term.'
              : 'Client reviews submitted on your website will appear here for review and management.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, idx) => {
            const stars = t.rating ? Math.min(5, Math.max(1, t.rating)) : 5;
            const isApproved = t.status === 'approved' || !t.status;

            return (
              <div
                key={t.id || idx}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-md"
              >
                <div>
                  {/* Top rating & status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s < stars
                              ? 'fill-accent text-accent'
                              : 'fill-muted/20 text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                        isApproved
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Live on site
                        </>
                      ) : (
                        <>
                          <Clock className="h-2.5 w-2.5" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Quote */}
                  <blockquote className="mt-3 text-xs leading-relaxed text-foreground/90 italic">
                    “{t.quote}”
                  </blockquote>
                </div>

                {/* Author Info & Actions */}
                <div className="mt-5 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 font-bold text-accent text-xs">
                        {t.initials || t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.name}</p>
                        <p className="text-[0.7rem] text-muted-foreground">{t.role || 'Client'}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(t)}
                        title={isApproved ? 'Unpublish / Set to pending' : 'Approve & publish'}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isApproved
                            ? 'text-muted-foreground hover:bg-surface/80 hover:text-amber-400'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {isApproved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>

                      {t.id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          title="Delete review"
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {t.createdAt && (
                    <p className="mt-2 text-[0.65rem] text-muted-foreground/80">
                      Submitted on {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">Add Client Testimonial</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rating
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          s <= rating
                            ? 'fill-accent text-accent'
                            : 'fill-transparent text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-accent ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role / Company
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. CEO, Apex Tech"
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Review Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Write the review or feedback statement..."
                  className="mt-1 w-full rounded-xl border border-border bg-surface p-3 text-xs sm:text-sm text-foreground focus:border-accent focus:outline-none resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
