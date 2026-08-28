import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { PROCESS_STEPS } from '../data/siteData';

export function Process() {
  return (
    <section className="border-y border-border/70 bg-surface/30">
      <div className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14">
        <SectionHeading
          label="Process"
          title={
            <>
              How I Turn Ideas <span className="text-gradient">Into Design</span>
            </>
          }
        />

        <ol className="mt-14 grid gap-y-10 sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-16">
          {PROCESS_STEPS.map((step, idx) => (
            <Reveal
              key={step.n}
              as="li"
              delay={(idx % 3) * 90}
              className="relative list-none"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-display text-5xl font-bold text-transparent [-webkit-text-stroke:1px_var(--border)] sm:text-6xl">
                  {step.n}
                </span>
                <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                  {step.title}
                </h3>
              </div>

              <div className="mt-5 h-px w-full bg-border">
                <div className="h-px w-1/3 bg-gradient-accent" />
              </div>

              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
