import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  MessageSquarePlus,
  Send,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { TESTIMONIALS as STATIC_TESTIMONIALS } from '../data/siteData';
import { Testimonial } from '../types';
import { apiGetTestimonials, apiSubmitTestimonial, getLocalTestimonials } from '../lib/api';

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good Quality',
  4: 'Very Good & Recommended',
  5: 'Exceptional — 5 Stars!',
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(STATIC_TESTIMONIALS);
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Review Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch approved reviews from server & local storage
  const loadReviews = async () => {
    try {
      const serverList = await apiGetTestimonials(false);
      const localList = getLocalTestimonials();

      // If server returned reviews, use them as source of truth along with new local submissions
      if (Array.isArray(serverList) && serverList.length > 0) {
        const approved = serverList.filter((t) => t.status === 'approved' || !t.status);
        if (approved.length > 0) {
          setTestimonials(approved);
          return;
        }
      }

      // Fallback: merge static testimonials with approved local items
      const mergedMap = new Map<string, Testimonial>();
      STATIC_TESTIMONIALS.forEach((t) => mergedMap.set(t.id || t.name, t));
      localList.forEach((t) => {
        if (t.status === 'approved' || !t.status) {
          mergedMap.set(t.id || t.name, t);
        }
      });

      const list = Array.from(mergedMap.values());
      if (list.length > 0) {
        setTestimonials(list);
      }
    } catch (err) {
      console.log('Using static testimonials:', err);
      setTestimonials(STATIC_TESTIMONIALS);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please provide your name or business name.');
      return;
    }
    if (!quote.trim() || quote.trim().length < 10) {
      setFormError('Please write at least a sentence (10+ characters) sharing your feedback.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newReview = await apiSubmitTestimonial({
        name: name.trim(),
        role: role.trim() || 'Client',
        quote: quote.trim(),
        rating,
        status: 'approved',
      });

      // Optimistically add to state
      setTestimonials((prev) => [newReview, ...prev]);
      setIsSubmitted(true);
      setName('');
      setRole('');
      setQuote('');
      setRating(5);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRatingDisplay = hoverRating !== null ? hoverRating : rating;

  return (
    <section id="testimonials" className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14">
      <SectionHeading
        label="Testimonials"
        title={
          <>
            What <span className="text-gradient">Clients Say</span>
          </>
        }
        subtitle="Real stories, honest reviews, and feedback from creators, founders, and teams worldwide."
      />

      {/* Testimonials Cards Grid */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, idx) => {
          const starsCount = t.rating ? Math.min(5, Math.max(1, t.rating)) : 5;
          const displayInitials =
            t.initials ||
            t.name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

          return (
            <Reveal
              key={t.id || `${t.name}-${idx}`}
              delay={(idx % 3) * 100}
              className="glass relative flex h-full flex-col rounded-3xl p-7 sm:p-8 transition-all duration-500 hover:border-accent/40 hover:-translate-y-1 shadow-lg group"
            >
              {/* Star Rating Badge */}
              <div className="flex items-center justify-between">
                <div
                  className="flex gap-1"
                  aria-label={`Rated ${starsCount} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className={`h-4 w-4 ${
                        sIdx < starsCount
                          ? 'fill-accent text-accent'
                          : 'fill-muted/20 text-muted-foreground/30'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {t.createdAt && (
                  <span className="text-[0.68rem] text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {/* Review Quote */}
              <blockquote className="mt-5 flex-1 text-sm sm:text-base leading-relaxed text-muted-foreground">
                “{t.quote}”
              </blockquote>

              {/* Client Info Footer */}
              <div className="mt-6 flex items-center gap-3 border-t border-border/80 pt-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-accent font-display text-sm font-semibold text-accent-foreground shadow-sm">
                  {displayInitials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.role || 'Client'}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* =========================================================================
          INTERACTIVE REVIEW / FEEDBACK FORM
          ========================================================================= */}
      <Reveal delay={150} className="mt-16 sm:mt-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface/60 backdrop-blur-xl p-6 sm:p-10 lg:p-12 shadow-2xl">
          {/* Subtle background ambient glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Add Your Feedback
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Worked with <span className="text-gradient">NIFTYGRAPHY</span>?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                We value your partnership! Share your experience, results, or collaboration feedback to help future clients.
              </p>
            </div>

            {/* Success State */}
            {isSubmitted ? (
              <div className="mt-8 rounded-2xl border border-accent/40 bg-accent/10 p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="mt-4 font-display text-lg font-bold text-foreground sm:text-xl">
                  Thank You for Your Feedback!
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Your review has been successfully recorded and published to our testimonials. We truly appreciate your trust and recommendation!
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              </div>
            ) : (
              /* Review Form */
              <form onSubmit={handleSubmitReview} className="mt-8 space-y-6">
                {formError && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                    {formError}
                  </div>
                )}

                {/* Rating Selection */}
                <div className="rounded-2xl border border-border bg-background/50 p-4 sm:p-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Overall Rating
                  </label>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="flex gap-1.5" role="radiogroup" aria-label="Select star rating">
                      {[1, 2, 3, 4, 5].map((starNum) => {
                        const isFilled = starNum <= activeRatingDisplay;
                        return (
                          <button
                            key={starNum}
                            type="button"
                            onClick={() => setRating(starNum)}
                            onMouseEnter={() => setHoverRating(starNum)}
                            onMouseLeave={() => setHoverRating(null)}
                            aria-label={`${starNum} Star${starNum > 1 ? 's' : ''}`}
                            className="group p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                          >
                            <Star
                              className={`h-7 w-7 transition-colors duration-200 ${
                                isFilled
                                  ? 'fill-accent text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb,255,215,0),0.5)]'
                                  : 'fill-transparent text-muted-foreground/40 group-hover:text-muted-foreground'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-xs sm:text-sm font-semibold text-accent animate-in fade-in duration-200">
                      {RATING_LABELS[activeRatingDisplay] || `${activeRatingDisplay} Stars`}
                    </span>
                  </div>
                </div>

                {/* Two Column Inputs: Name & Role/Company */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="review-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Your Name / Brand <span className="text-accent">*</span>
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="review-role"
                      className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Company, Channel or Role
                    </label>
                    <input
                      id="review-role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Founder, Nova Studio / YouTuber"
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Feedback Message */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="review-message"
                      className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Review / Feedback Message <span className="text-accent">*</span>
                    </label>
                    <span className="text-[0.68rem] text-muted-foreground">
                      {quote.length} characters
                    </span>
                  </div>
                  <textarea
                    id="review-message"
                    rows={4}
                    required
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Tell us about the project outcome, turnaround time, communication, and overall design quality..."
                    className="mt-1.5 w-full rounded-xl border border-border bg-background p-4 text-xs sm:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                  <p className="text-[0.72rem] text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                    Reviews are automatically published and synced with our verified client records.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-7 py-3 text-xs sm:text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-102 hover:shadow-accent/30 disabled:opacity-50 shrink-0"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

