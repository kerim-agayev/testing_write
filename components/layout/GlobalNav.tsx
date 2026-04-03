'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/components/providers/ThemeProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Avatar } from '@/components/ui/Avatar';
import { Sun, Moon, Monitor, ChevronDown, LogOut, User, Shield, BookOpen, GraduationCap, Bell } from 'lucide-react';

export function GlobalNav() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const t = useTranslations('nav');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = session?.user;

  const themeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  return (
    <nav className="h-16 bg-surface-card border-b border-border px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-semibold text-primary tracking-tight">
          ScriptFlow
        </Link>

        {/* Main nav links based on role */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-surface-hover rounded transition-colors">
              {t('dashboard')}
            </Link>
            {(user.role === 'MENTOR' || user.role === 'ADMIN') && (
              <Link href="/mentor" className="px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-surface-hover rounded transition-colors">
                Mentor
              </Link>
            )}
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-surface-hover rounded transition-colors">
                Admin
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher current="az" />

        <button
          onClick={cycleTheme}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-hover transition-colors"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="w-4 h-4 text-txt-secondary" />
        </button>

        {user && (
          <>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-hover transition-colors relative">
              <Bell className="w-4 h-4 text-txt-secondary" />
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Avatar name={user.name || 'User'} size={32} />
                <ChevronDown className="w-3.5 h-3.5 text-txt-muted" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 z-50 glass rounded-lg py-2">
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="text-sm font-medium text-txt-primary truncate">{user.name}</p>
                      <p className="text-xs text-txt-muted truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-txt-primary hover:bg-surface-hover transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <BookOpen className="w-4 h-4 text-txt-muted" />
                      {t('myScreenplays') || t('dashboard')}
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-txt-primary hover:bg-surface-hover transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-txt-muted" />
                      {t('profile')}
                    </Link>

                    {(user.role === 'MENTOR' || user.role === 'ADMIN') && (
                      <Link
                        href="/mentor"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-txt-primary hover:bg-surface-hover transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <GraduationCap className="w-4 h-4 text-txt-muted" />
                        Mentor Panel
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-txt-primary hover:bg-surface-hover transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 text-txt-muted" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-surface-hover transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
