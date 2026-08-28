import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Reveal } from './Reveal';
import { ABOUT_SLIDES, SKILLS_LIST } from '../data/siteData';

export function About() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % ABOUT_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? ABOUT_SLIDES.length - 1 : prev - 1));
  }, []);

  // Auto-play every 4 seconds, paused on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  const activeSlideData = ABOUT_SLIDES[currentSlide] || ABOUT_SLIDES[0];

  return (
    <section
      id="about"
      className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14"
    >
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Left Column - Multi-Image Carousel Card */}
        <Reveal className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-gradient-accent opacity-20 blur-[70px]"
          />

          {/* Main Carousel Container */}
          <div
            className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-2xl transition-all duration-300 hover:border-accent/40"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="About Photo Carousel"
          >
            {/* Image Slider Track */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface/90">
              {ABOUT_SLIDES.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={slide.url}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      isActive
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-105 pointer-events-none z-0'
                    }`}
                  >
                    <img
                      src={slide.url}
                      alt={slide.alt}
                      width={912}
                      height={1200}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-103"
                    />

                    {/* Dark gradient overlay for bottom legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent opacity-90" />
                  </div>
                );
              })}

              {/* Top Right Counter Indicator */}
              <div className="absolute top-4 right-4 z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-[0.7rem] font-semibold tracking-wider text-foreground backdrop-blur-md shadow-md">
                  <span className="text-accent">{currentSlide + 1}</span>
                  <span className="text-muted-foreground/60">/</span>
                  <span className="text-muted-foreground">{ABOUT_SLIDES.length}</span>
                </span>
              </div>

              {/* Navigation Left / Right Buttons */}
              <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-3 pointer-events-none">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous image"
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/75 text-foreground backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:border-accent hover:bg-background hover:text-accent active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <ChevronLeft className="h-5 w-5 -ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next image"
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/75 text-foreground backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:border-accent hover:bg-background hover:text-accent active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <ChevronRight className="h-5 w-5 -mr-0.5" />
                </button>
              </div>

              {/* Bottom Pagination Dots */}
              <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
                {ABOUT_SLIDES.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlide(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                      dotIdx === currentSlide
                        ? 'w-7 bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb,255,215,0),0.6)]'
                        : 'w-2 bg-foreground/30 hover:bg-foreground/60'
                    }`}
                  />
                ))}
              </div>

              {/* Floating Glassmorphic Info Badge Overlay - Bottom Left */}
              <div className="absolute bottom-10 left-4 sm:left-5 z-20 max-w-[85%] rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300">
                <p className="font-display text-sm sm:text-base font-bold text-foreground tracking-tight">
                  Niftygraphy
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Independent professional graphic designer
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Right Column - Text & Skills */}
        <div className="lg:pt-6">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
            <span className="h-px w-8 bg-gradient-accent" aria-hidden="true" />
            About
          </span>

          <Reveal>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-5xl">
              Design is not just what I do.
              <br />
              <span className="text-gradient">It's how I communicate ideas.</span>
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Hi, I'm P.D. Yadeesha Shen Perera. With 3+ years of experience in graphic design, I
              focus on crafting distinct visual identities and engaging design solutions. I blend
              thoughtful aesthetics with functional layout to build memorable brand experiences that
              resonate with people.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <ul className="mt-9 flex flex-wrap gap-2.5">
              {SKILLS_LIST.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-border bg-surface/50 px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground sm:text-sm"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10">
              <Button href="#works" variant="outline">
                More About Me <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
