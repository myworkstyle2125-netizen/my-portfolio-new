import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  MessageSquarePlus,
  Send,
  ShieldCheck,
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

  // Duplicate testimonials array to form a continuous infinite seamless loop
  const displayItems = testimonials.length > 0 ? testimonials : STATIC_TESTIMONIALS;
  const loopTestimonials = [...displayItems, ...displayItems];

  return (
    <section id="testimonials" className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14 overflow-hidden">
      <SectionHeading
        label="Testimonials"
        title={
          <>
            What <span className="text-gradient">Clients Say</span>
          </>
        }
        subtitle="Real stories, honest reviews, and feedback from creators, founders, and teams worldwide."
      />

      {/* =========================================================================
          OVERALL RATING & SATISFACTION BADGES
          ========================================================================= */}
      <Reveal delay={60} className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-surface/90 px-4 py-2 text-xs sm:text-sm font-medium text-foreground shadow-lg backdrop-blur-md transition-transform hover:scale-105">
          <span className="text-accent text-base sm:text-lg leading-none">⭐</span>
          <span className="font-semibold text-foreground">4.9 / 5.0</span>
          <span className="text-muted-foreground">({testimonials.length} Client Reviews)</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/90 px-4 py-2 text-xs sm:text-sm font-medium text-foreground shadow-lg backdrop-blur-md transition-transform hover:scale-105">
          <span className="text-base sm:text-lg leading-none">🛡️</span>
          <span className="font-semibold text-foreground">100% Satisfaction Rate</span>
        </div>
      </Reveal>

      {/* =========================================================================
          INFINITE AUTO-SCROLLING CAROUSEL / MARQUEE
          ========================================================================= */}
      <div className="relative mt-12 sm:mt-14 w-full">
        {/* Left & Right Subtle Fade Gradient Masks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-20 bg-gradient-to-r from-background to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-20 bg-gradient-to-l from-background to-transparent"
        />

        {/* Scrolling Carousel Track */}
        <div className="overflow-hidden py-3">
          <div className="animate-marquee gap-6 flex items-stretch">
            {loopTestimonials.map((t, idx) => {
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
                <div
                  key={`${t.id || t.name}-${idx}`}
                  className="glass relative flex h-[290px] sm:h-[300px] w-[85vw] sm:w-[380px] lg:w-[420px] shrink-0 flex-col justify-between rounded-[1.75rem] border border-border/90 bg-surface/85 p-6 sm:p-7 shadow-lg transition-all duration-300 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10"
                >
                  {/* Top: Star Rating & Date */}
                  <div>
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

                    {/* Review Quote with Line Clamping */}
                    <blockquote className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-4">
                      “{t.quote}”
                    </blockquote>
                  </div>

                  {/* Client Info Footer */}
                  <div className="flex items-center gap-3 border-t border-border/80 pt-4 mt-auto">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-accent font-display text-xs font-bold text-accent-foreground shadow-sm">
                      {displayInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.role || 'Client'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtle Pause Hint */}
        <p className="mt-3 text-center text-[0.7rem] text-muted-foreground/60 tracking-wider">
          Hover over any review to pause scrolling
        </p>
      </div>

      {/* =========================================================================
          INTERACTIVE REVIEW / FEEDBACK FORM
          ========================================================================= */}
      <Reveal delay={120} className="mt-16 sm:mt-20">
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

                {/* Rating Selector */}
                <div className="rounded-2xl border border-border bg-background/50 p-4 sm:p-5 text-center">
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Your Rating
                  </label>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                        aria-label={`Select ${star} stars`}
                      >
                        <Star
                          className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                            star <= activeRatingDisplay
                              ? 'fill-accent text-accent'
                              : 'fill-muted/20 text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-medium text-accent">
                    {RATING_LABELS[activeRatingDisplay]}
                  </p>
                </div>

                {/* Name & Role Inputs */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="review-name"
                      className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Your Name / Brand *
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-input bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="review-role"
                      className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Role / Channel / Company
                    </label>
                    <input
                      id="review-role"
                      type="text"
                      placeholder="e.g. Founder, Horizon Tech - UK"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-input bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Review Quote Textarea */}
                <div>
                  <label
                    htmlFor="review-quote"
                    className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Your Experience / Feedback *
                  </label>
                  <textarea
                    id="review-quote"
                    required
                    rows={4}
                    placeholder="Tell us about the design quality, turnaround speed, communication, and results..."
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[0.72rem] text-muted-foreground">
                    Reviews publish immediately to our public portfolio.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-xs sm:text-sm font-semibold text-accent-foreground shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-accent/25 hover:scale-[1.02] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Post Review
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


