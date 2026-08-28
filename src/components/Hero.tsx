import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from './Button';
import { HERO_ABSTRACT_URL } from '../data/siteData';

export function Hero() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      animFrame.current = requestAnimationFrame(() => {
        setOffset({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-44">
      {/* Background Grids & Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.35] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-gradient-accent opacity-[0.16] blur-[130px]"
      />

      <div className="relative mx-auto grid max-w-[110rem] items-center gap-16 px-5 pb-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-14 lg:pb-28">
        {/* Left Column Text & CTA */}
        <div>
          <p
            className="reveal text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground sm:text-xs"
            data-visible="true"
          >
            Graphic Designer <span className="text-accent">•</span> Creative Designer{' '}
            <span className="text-accent">•</span> Visual Storyteller
          </p>

          <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[0.96] tracking-tight sm:text-6xl lg:text-[4.6rem]">
            <span className="block">I CREATE VISUALS</span>
            <span className="block">
              THAT MAKE <span className="text-gradient">BRANDS</span>
            </span>
            <span className="block">
              <span className="text-gradient">IMPOSSIBLE</span> TO IGNORE.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            I'm a graphic designer focused on creating bold, memorable and professional visual
            experiences for brands, creators and businesses.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="#works" className="w-full sm:w-auto">
              View My Work <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#contact" variant="outline" className="w-full sm:w-auto">
              Let's Work Together <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-9 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/50 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-xs text-muted-foreground sm:text-sm">
              Available for freelance projects
            </span>
          </div>
        </div>

        {/* Right Column Interactive Visual */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            className="relative aspect-square"
            style={{
              transform: `translate3d(${offset.x * 14}px, ${offset.y * 14}px, 0)`,
              transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-full bg-gradient-accent opacity-25 blur-[90px]"
            />
            <img
              src={HERO_ABSTRACT_URL}
              alt="Abstract three-dimensional glass composition with blue and violet gradient light"
              width={1024}
              height={1024}
              fetchPriority="high"
              className="relative h-full w-full rounded-[2rem] object-cover border border-border"
            />
          </div>

          {/* Floating typography pill */}
          <div
            className="glass float-soft absolute -left-2 top-8 rounded-2xl px-4 py-3 sm:left-0 shadow-lg"
            style={{
              transform: `translate3d(${offset.x * -26}px, ${offset.y * -20}px, 0)`,
            }}
          >
            <p className="font-display text-xs tracking-[0.2em] text-muted-foreground">
              TYPOGRAPHY
            </p>
            <p className="font-display text-2xl font-bold">Aa</p>
          </div>

          {/* Floating brand systems pill */}
          <div
            className="glass absolute -right-1 bottom-10 rounded-2xl px-4 py-3 sm:right-2 shadow-lg"
            style={{
              transform: `translate3d(${offset.x * 30}px, ${offset.y * 24}px, 0)`,
            }}
          >
            <p className="text-xs text-muted-foreground">Brand systems</p>
            <p className="font-display text-lg font-semibold">Identity · Motion · Print</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative flex justify-center pb-12">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Scroll
          </span>
          <span className="relative h-12 w-px overflow-hidden bg-border">
            <span className="scroll-hint absolute inset-0 bg-gradient-accent" />
          </span>
        </div>
      </div>
    </section>
  );
}
