import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Reveal } from './Reveal';
import { SITE_CONFIG } from '../data/siteData';

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden border-y border-border/70">
      {/* Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-accent opacity-[0.14] blur-[140px]"
      />

      <Reveal className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <h2 className="text-3xl font-semibold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
          Have a project in mind?
          <br />
          <span className="text-gradient">Let's create something great.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Whether you need a brand identity, social media campaign, YouTube thumbnails or a complete
          visual design system, I'd love to hear about your project.
        </p>

        <div className="mt-10 flex flex-col items-center gap-5">
          <Button href="#contact">
            Start a Project <ArrowRight className="h-4 w-4" />
          </Button>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {SITE_CONFIG.email}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
