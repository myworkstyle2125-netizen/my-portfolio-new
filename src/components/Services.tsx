import {
  ArrowUpRight,
  Fingerprint,
  Layers,
  MonitorSmartphone,
  Printer,
  Shirt,
  Youtube,
} from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { SERVICES } from '../data/siteData';

const iconMap = {
  fingerprint: Fingerprint,
  layers: Layers,
  youtube: Youtube,
  shirt: Shirt,
  monitor: MonitorSmartphone,
  printer: Printer,
};

export function Services() {
  return (
    <section
      id="services"
      className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14"
    >
      <SectionHeading
        label="Services"
        title={
          <>
            What I Can Do For <span className="text-gradient">Your Brand</span>
          </>
        }
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, idx) => {
          const IconComp = iconMap[service.iconName];
          return (
            <Reveal
              key={service.title}
              delay={(idx % 3) * 90}
              className="group relative bg-background p-8 transition-colors duration-500 hover:bg-surface sm:p-10"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(400px circle at 50% 0%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)',
                }}
              />

              <div className="relative flex items-start justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2/60 transition-colors duration-500 group-hover:border-accent/50">
                  <IconComp className="h-5 w-5 text-accent" aria-hidden="true" />
                </span>
                <span className="font-display text-sm tabular-nums text-muted-foreground">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="relative mt-8 text-xl font-semibold text-foreground sm:text-2xl">
                {service.title}
              </h3>

              <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <span className="relative mt-7 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
