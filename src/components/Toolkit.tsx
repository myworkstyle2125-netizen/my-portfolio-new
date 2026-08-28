import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { TOOLKIT } from '../data/siteData';

export function Toolkit() {
  return (
    <section className="mx-auto max-w-[110rem] px-5 pb-24 sm:px-8 sm:pb-32 lg:px-14">
      <SectionHeading label="Toolkit" title="Tools I Use" />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {TOOLKIT.map((tool, idx) => (
          <Reveal
            key={tool.name}
            delay={idx * 70}
            className="group rounded-2xl border border-border bg-surface/40 p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-accent/50 hover:bg-surface"
          >
            <span className="font-display text-3xl font-bold text-muted-foreground transition-colors duration-500 group-hover:text-gradient">
              {tool.short}
            </span>
            <p className="mt-3 text-xs leading-snug text-muted-foreground sm:text-sm">
              {tool.name}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
