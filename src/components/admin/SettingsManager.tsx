import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  KeyRound,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { AdminSettings } from '../../types';
import { apiChangePassword, apiUpdateSettings } from '../../lib/api';

interface SettingsManagerProps {
  settings: AdminSettings;
  onRefresh: () => void;
}

export function SettingsManager({ settings, onRefresh }: SettingsManagerProps) {
  const [formData, setFormData] = useState<AdminSettings>({
    siteName: settings.siteName || 'NIFTYGRAPHY',
    tagline: settings.tagline || 'Designing ideas into visual experiences.',
    email: settings.email || 'niftygraphy24@gmail.com',
    whatsappNumber: settings.whatsappNumber || '94759700219',
    whatsappLabel: settings.whatsappLabel || '+94 75 970 0219',
    location: settings.location || 'Colombo, Sri Lanka — working worldwide',
    bio:
      settings.bio ||
      "Hi, I'm P.D. Yadeesha Shen Perera. With 3+ years of experience in graphic design, I focus on crafting distinct visual identities and engaging design solutions.",
    ownerName: settings.ownerName || 'P.D. Yadeesha Shen Perera',
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsFeedback(null);
    try {
      await apiUpdateSettings(formData);
      setSettingsFeedback('Profile settings saved successfully!');
      onRefresh();
      setTimeout(() => setSettingsFeedback(null), 3000);
    } catch (err: any) {
      setSettingsFeedback(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setChangingPassword(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      setPasswordFeedback({ type: 'success', text: 'Admin password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open('/data/db.json', '_blank');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          CMS & Owner Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your personal profile information, contact channels, credentials, and portfolio database backups.
        </p>
      </div>

      {/* Profile & Website Info */}
      <form onSubmit={handleSaveSettings} className="rounded-2xl border border-border bg-surface p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Designer Profile & Contact</h2>
            <p className="text-xs text-muted-foreground">Information displayed to clients across the portfolio.</p>
          </div>
        </div>

        {settingsFeedback && (
          <div className="rounded-xl border border-success/30 bg-success/15 p-3 text-xs text-success flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{settingsFeedback}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Owner Name
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Site Brand Title
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              WhatsApp Number (Numeric with Country Code)
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="94759700219"
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              WhatsApp Display Label
            </label>
            <input
              type="text"
              value={formData.whatsappLabel}
              onChange={(e) => setFormData({ ...formData, whatsappLabel: e.target.value })}
              placeholder="+94 75 970 0219"
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Location & Availability
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Colombo, Sri Lanka — working worldwide"
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hero Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              About Bio
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm hover:scale-102 transition-transform disabled:opacity-50"
          >
            {savingSettings ? (
              <>
                Saving <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Profile Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Change Password Section */}
      <form onSubmit={handleChangePassword} className="rounded-2xl border border-border bg-surface p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Change Admin Password</h2>
            <p className="text-xs text-muted-foreground">Update your owner dashboard login passcode.</p>
          </div>
        </div>

        {passwordFeedback && (
          <div
            className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
              passwordFeedback.type === 'success'
                ? 'border border-success/30 bg-success/15 text-success'
                : 'border border-destructive/30 bg-destructive/15 text-destructive'
            }`}
          >
            {passwordFeedback.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            <span>{passwordFeedback.text}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs text-foreground focus:border-accent"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changingPassword}
            className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent/15 px-6 py-2.5 text-xs font-semibold text-accent hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
          >
            {changingPassword ? (
              <>
                Updating <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" /> Update Password
              </>
            )}
          </button>
        </div>
      </form>

      {/* Database Backup & Export */}
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Database Backup</h2>
            <p className="text-xs text-muted-foreground">Export your portfolio projects and records safely.</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          All your uploaded portfolio works, case study details, categories, pricing packages, and client messages are securely persisted on your server database. You can export a snapshot anytime.
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground font-mono">/data/db.json</span>
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-xs font-semibold text-foreground hover:border-accent/60 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-accent" /> Export Database Backup
          </button>
        </div>
      </div>
    </div>
  );
}
