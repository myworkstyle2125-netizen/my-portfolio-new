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
            delay={idx * 60}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 sm:p-7 text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-purple-500/50 hover:bg-surface hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]"
          >
            {/* Animated Diagonal Light Sweep Effect */}
            <div aria-hidden="true" className="light-sweep" />

            {/* Subtle Purple/Blue Ambient Glow on Hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-500/10 via-indigo-500/5 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
            />

            {/* Tool Initials with Shimmering Gradient Hover */}
            <span className="relative block font-display text-3xl sm:text-4xl font-bold tracking-tight text-muted-foreground/80 transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:via-indigo-300 group-hover:to-pink-400">
              {tool.short}
            </span>

            {/* Tool Full Name */}
            <p className="relative mt-3 text-xs sm:text-sm font-medium leading-snug text-muted-foreground transition-colors duration-300 ease-out group-hover:text-foreground">
              {tool.name}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
