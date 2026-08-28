import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Lock, Mail, Shield } from 'lucide-react';
import { apiLogin } from '../../lib/api';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToSite: () => void;
}

export function AdminLogin({ onSuccess, onBackToSite }: AdminLoginProps) {
  const [email, setEmail] = useState('niftygraphy24@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiLogin(password, email);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid owner credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('niftygraphy24@gmail.com');
    setPassword('niftygraphy2026');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="w-full max-w-md mb-6">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Portfolio
        </button>
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/30 shadow-inner mb-4">
            <Shield className="h-7 w-7" />
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Owner CMS Login
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Sign in to manage your NIFTYGRAPHY portfolio projects, upload designs and manage client inquiries.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/15 p-3 text-xs text-destructive text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Owner Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="niftygraphy24@gmail.com"
                className="w-full rounded-xl border border-input bg-background/60 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-[0.7rem] text-accent hover:underline"
              >
                Fill default credentials
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background/60 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent py-3 text-xs font-semibold text-accent-foreground shadow-md transition-all hover:scale-101 disabled:opacity-50"
          >
            {loading ? (
              <>
                Signing In <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Access Admin Dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/80 text-center">
          <p className="text-[0.7rem] text-muted-foreground">
            Default owner passcode: <span className="font-mono text-accent">niftygraphy2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
