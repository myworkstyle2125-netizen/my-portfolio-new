import { Reveal } from './Reveal';
import { STATS } from '../data/siteData';

export function Stats() {
  return (
    <section aria-label="Key figures" className="border-y border-border/70">
      <div className="mx-auto grid max-w-[110rem] grid-cols-2 gap-px bg-border/70 sm:grid-cols-4">
        {STATS.map((stat, idx) => (
          <Reveal
            key={stat.label}
            delay={idx * 90}
            className="bg-background px-6 py-10 text-center sm:py-14"
          >
            <p className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {stat.value}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm sm:tracking-[0.12em]">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
