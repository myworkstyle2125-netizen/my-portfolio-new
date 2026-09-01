import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Shield, User } from 'lucide-react';
import { apiLogin } from '../../lib/api';
import { LOGO_URL, SITE_CONFIG } from '../../data/siteData';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export function AdminLogin({ onSuccess, onBackToSite }: AdminLoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your owner email or username and password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await apiLogin(password, identifier.trim());
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid owner credentials. Please verify your email/username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Portfolio
        </button>

        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
          Owner Access
        </span>
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/30 shadow-inner mb-4">
            <img
              src={LOGO_URL}
              alt="NIFTYGRAPHY"
              className="h-9 w-9 rounded-lg object-cover"
            />
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Owner Portal
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-xs">
            Sign in with your authorized owner credentials to access the NIFTYGRAPHY dashboard.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/15 p-3 text-xs text-destructive text-center font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Email or Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="NIFTYGRAPHY"
                className="w-full rounded-xl border border-input bg-background/70 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background/70 pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent py-3 text-xs font-semibold text-accent-foreground shadow-md transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                Authenticating <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border/60 text-center">
          <p className="text-[0.68rem] text-muted-foreground">
            Protected owner management portal • NIFTYGRAPHY
          </p>
        </div>
      </div>
    </div>
  );
}
