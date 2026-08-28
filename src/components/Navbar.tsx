import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { LOGO_URL, SITE_CONFIG } from '../data/siteData';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-border'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[110rem] items-center justify-between px-5 sm:h-20 sm:px-8 lg:px-14"
      >
        <a
          href="#home"
          className="flex items-center gap-3"
          aria-label={SITE_CONFIG.name}
        >
          <img
            src={LOGO_URL}
            alt={SITE_CONFIG.name}
            width={40}
            height={40}
            className="h-9 w-9 rounded-lg object-cover sm:h-10 sm:w-10"
          />
          <span className="font-display text-base font-semibold tracking-[0.22em] sm:text-lg">
            {SITE_CONFIG.name}
          </span>
        </a>

        <ul className="hidden items-center gap-9 lg:flex">
          {SITE_CONFIG.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gradient-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="group hidden items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/60 hover:bg-surface lg:inline-flex"
        >
          Let's Talk
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        id="mobile-menu"
        className={`glass overflow-hidden border-t transition-[max-height,opacity] duration-500 lg:hidden ${
          mobileOpen
            ? 'max-h-[28rem] border-border opacity-100'
            : 'max-h-0 border-transparent opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 py-6 sm:px-8">
          {SITE_CONFIG.nav.map((item, idx) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: `${idx * 40}ms` }}
                className="block border-b border-border/60 py-4 font-display text-2xl font-medium text-foreground transition-colors hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li className="pt-5">
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-6 py-3.5 text-sm font-medium text-accent-foreground"
            >
              Let's Talk <ArrowUpRight className="h-4 w-4" />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
