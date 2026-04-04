'use client';

import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '@/lib/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { Avatar } from '@/components/ui/Avatar';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useUIStore } from '@/store/uiStore';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { UserProfile } from '@/types/api';

export default function ProfilePage() {
  const { data } = useProfile();
  const profile = data as UserProfile | undefined;
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  const addToast = useUIStore((s) => s.addToast);
  const tc = useTranslations('common');

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailNotif, setEmailNotif] = useState(true);
  const [mentorNotif, setMentorNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ name });
      addToast('Profile updated', 'success');
    } catch {
      addToast('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      await updateProfile.mutateAsync({ currentPassword, newPassword });
      addToast('Password updated', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      addToast('Failed to update password', 'error');
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-txt-muted">{tc('loading')}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold text-txt-primary">Profile Settings</h1>

      {/* Account */}
      <section className="bg-surface-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-txt-primary mb-4">Account</h2>
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={profile.name} size={44} />
          <div>
            <p className="font-medium text-txt-primary">{profile.name}</p>
            <p className="text-sm text-txt-muted">{profile.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={profile.email} disabled />
          <Button onClick={handleSaveProfile} loading={updateProfile.isPending}>Save Changes</Button>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-surface-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-txt-primary mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-txt-secondary mb-2">Language</label>
            <LanguageSwitcher />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-txt-secondary mb-2">Theme</label>
            <div className="flex gap-2">
              {([
                { value: 'light' as const, icon: Sun, label: 'Light' },
                { value: 'dark' as const, icon: Moon, label: 'Dark' },
                { value: 'system' as const, icon: Monitor, label: 'System' },
              ]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all',
                    theme === t.value ? 'border-primary bg-[#F8F7FF] text-primary' : 'border-border text-txt-secondary hover:border-txt-muted'
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-surface-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-txt-primary mb-4">Security</h2>
        <div className="space-y-4">
          <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button variant="standard" onClick={handleChangePassword}>Update Password</Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-surface-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-txt-primary mb-4">Notifications</h2>
        <div className="space-y-3">
          <Toggle checked={emailNotif} onChange={setEmailNotif} label="Email notifications" />
          <Toggle checked={mentorNotif} onChange={setMentorNotif} label="When a mentor adds a note" />
          <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly writing summary" />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-surface-card border border-danger/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-danger mb-2">Danger Zone</h2>
        <p className="text-sm text-txt-secondary mb-4">
          This action cannot be undone. Permanently delete your account and all associated data.
        </p>
        <Button variant="danger">Delete Account</Button>
      </section>
    </div>
  );
}
