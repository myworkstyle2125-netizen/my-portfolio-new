import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { BUDGET_RANGES, PROJECT_TYPES, SITE_CONFIG } from '../data/siteData';

const inputStyles =
  'w-full rounded-xl border border-input bg-surface/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/60';

export function Contact() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const whatsapp = String(formData.get('whatsapp') ?? '').replace(/[\s()-]/g, '');
    const company = String(formData.get('company') ?? '').trim();
    const projectType = String(formData.get('projectType') ?? '');
    const budget = String(formData.get('budget') ?? '');
    const message = String(formData.get('message') ?? '').trim();
    const website = String(formData.get('website') ?? ''); // honeypot

    // Validation
    if (website) return; // bot detected
    if (!name) {
      setStatusMessage({ type: 'error', text: 'Please enter your name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!/^\+?[0-9]{7,15}$/.test(whatsapp)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid WhatsApp number with country code (e.g. +94759700219).',
      });
      return;
    }
    if (!company) {
      setStatusMessage({ type: 'error', text: 'Please enter your company or brand.' });
      return;
    }
    if (!projectType) {
      setStatusMessage({ type: 'error', text: 'Please select a project type.' });
      return;
    }
    if (!budget) {
      setStatusMessage({ type: 'error', text: 'Please select a budget range.' });
      return;
    }
    if (message.length < 10) {
      setStatusMessage({
        type: 'error',
        text: 'Please tell us a little about your project (at least 10 characters).',
      });
      return;
    }

    const whatsappText = [
      '*New Project Inquiry — NIFTYGRAPHY*',
      '',
      `*Name:* ${name}`,
      `*Email:* ${email}`,
      `*WhatsApp Number:* ${whatsapp}`,
      `*Company / Brand:* ${company}`,
      `*Project Type:* ${projectType}`,
      `*Budget:* ${budget}`,
      '',
      '*Project Details:*',
      message,
    ].join('\n');

    const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
      whatsappText
    )}`;

    setLoading(true);

    try {
      // 1. Save to owner database
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          company,
          projectType,
          budget,
          message,
        }),
      }).catch((err) => console.log('CMS message logging:', err));

      // 2. Submit to Web3Forms
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: SITE_CONFIG.web3formsAccessKey,
          subject: 'New Project Inquiry — NIFTYGRAPHY',
          from_name: 'NIFTYGRAPHY Website',
          replyto: email,
          name,
          email,
          whatsapp_number: whatsapp,
          company,
          project_type: projectType,
          budget,
          message,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message ?? 'Email delivery failed');
      }

      setStatusMessage({
        type: 'success',
        text: 'Thank You! 👋 Your inquiry has been received. Opening WhatsApp…',
      });
      form.reset();

      // Open WhatsApp after brief moment
      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }, 800);
    } catch (err) {
      console.error(err);
      // Fallback: still open WhatsApp so user inquiry is never lost
      setStatusMessage({
        type: 'success',
        text: 'Opening WhatsApp to complete your inquiry…',
      });
      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="mx-auto max-w-[110rem] px-5 py-24 sm:px-8 sm:py-32 lg:px-14"
    >
      <SectionHeading
        label="Contact"
        title={
          <>
            Tell me about <span className="text-gradient">your project</span>
          </>
        }
        subtitle="Share a few details and I'll come back with availability, timeline and a quote tailored to what you need."
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
        {/* Form Column */}
        <Reveal>
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                autoComplete="name"
                placeholder="Your name"
                className={inputStyles}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className={inputStyles}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="whatsapp"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                WhatsApp Number
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                pattern="^\\+?[0-9\\s()-]{7,20}$"
                placeholder="+94 7X XXX XXXX"
                className={inputStyles}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="company"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                Company / Brand
              </label>
              <input
                id="company"
                name="company"
                required
                autoComplete="organization"
                placeholder="Your company or brand"
                className={inputStyles}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="projectType"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                defaultValue=""
                required
                className={inputStyles}
              >
                <option value="" disabled>
                  Select a type
                </option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label
                htmlFor="budget"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                Budget
              </label>
              <select
                id="budget"
                name="budget"
                defaultValue=""
                required
                className={inputStyles}
              >
                <option value="" disabled>
                  Select a range
                </option>
                {BUDGET_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label
                htmlFor="message"
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="What are you building, and when do you need it?"
                className={`${inputStyles} resize-y`}
              />
            </div>

            {/* Honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {statusMessage && (
              <div
                className={`sm:col-span-2 rounded-xl p-4 text-sm flex items-center gap-3 ${
                  statusMessage.type === 'success'
                    ? 'bg-success/15 border border-success/30 text-success'
                    : 'bg-destructive/15 border border-destructive/30 text-destructive'
                }`}
              >
                {statusMessage.type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                {statusMessage.text}
              </div>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-7 py-3.5 text-sm font-medium text-accent-foreground transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto disabled:opacity-70"
              >
                {loading ? (
                  <>
                    Sending <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Send Project Inquiry <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Note: Clicking ‘Send Project Inquiry’ will submit your order directly to our Email.
                WhatsApp will also open automatically—please tap ‘Send’ to connect with us
                instantly!
              </p>
            </div>
          </form>
        </Reveal>

        {/* Right Info Column */}
        <Reveal delay={120} className="flex flex-col gap-10">
          <div>
            <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Email</h3>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="mt-3 block font-display text-xl font-medium text-foreground transition-colors hover:text-accent sm:text-2xl"
            >
              {SITE_CONFIG.email}
            </a>
            <p className="mt-2 text-sm text-muted-foreground">{SITE_CONFIG.location}</p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              WhatsApp
            </h3>
            <a
              href={SITE_CONFIG.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block font-display text-xl font-medium text-foreground transition-colors hover:text-accent sm:text-2xl"
            >
              {SITE_CONFIG.whatsapp.label}
            </a>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Social</h3>
            <ul className="mt-4 grid gap-3">
              {SITE_CONFIG.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
