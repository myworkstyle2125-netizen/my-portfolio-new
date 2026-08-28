import { Star } from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { TESTIMONIALS } from '../data/siteData';

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14">
      <SectionHeading
        label="Testimonials"
        title={
          <>
            What <span className="text-gradient">Clients Say</span>
          </>
        }
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {TESTIMONIALS.map((t, idx) => (
          <Reveal
            key={t.name}
            delay={idx * 100}
            className="glass flex h-full flex-col rounded-3xl p-8 transition-colors duration-500 hover:border-accent/40 shadow-lg"
          >
            <div className="flex gap-1" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }).map((_, sIdx) => (
                <Star
                  key={sIdx}
                  className="h-4 w-4 fill-accent text-accent"
                  aria-hidden="true"
                />
              ))}
            </div>

            <blockquote className="mt-6 flex-1 text-base leading-relaxed text-muted-foreground">
              “{t.quote}”
            </blockquote>

            <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-accent font-display text-sm font-semibold text-accent-foreground">
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
