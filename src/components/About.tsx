import { ArrowUpRight } from 'lucide-react';
import { Button } from './Button';
import { Reveal } from './Reveal';
import { PORTRAIT_URL, SKILLS_LIST } from '../data/siteData';

export function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14"
    >
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Left Column - Image Card */}
        <Reveal className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-gradient-accent opacity-20 blur-[70px]"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border">
            <img
              src={PORTRAIT_URL}
              alt="Portrait of the graphic designer behind Niftygraphy"
              width={912}
              height={1200}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover transition-transform duration-[1.2s] hover:scale-[1.03]"
            />
          </div>
          <div className="glass absolute -bottom-6 left-6 right-6 rounded-2xl px-5 py-4 shadow-xl">
            <p className="font-display text-sm font-semibold text-foreground">Niftygraphy</p>
            <p className="text-xs text-muted-foreground">
              Independent professional graphic designer
            </p>
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
