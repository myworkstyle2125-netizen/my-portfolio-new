import { Lock } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteData';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto max-w-[110rem] px-5 py-16 sm:px-8 lg:px-14">
        {/* Giant Outlined Typography */}
        <p className="font-display text-[13vw] font-bold leading-[0.85] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_var(--border)] sm:text-[11vw] select-none">
          {SITE_CONFIG.name}
        </p>

        <p className="mt-6 max-w-md text-sm text-muted-foreground">
          {SITE_CONFIG.tagline}
        </p>

        <div className="mt-14 grid gap-10 border-t border-border pt-10 sm:grid-cols-2">
          {/* Nav */}
          <nav aria-label="Footer">
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              Navigate
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
              {SITE_CONFIG.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
              Social
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
              {SITE_CONFIG.socials.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            © 2026 Niftygraphy. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() => {
              if (onOpenAdmin) onOpenAdmin();
              else {
                window.location.hash = '#admin';
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-accent transition-colors"
          >
            <Lock className="h-3 w-3" /> Owner Admin Portal
          </button>
        </div>
      </div>
    </footer>
  );
}
