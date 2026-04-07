'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils/cn';

const LANGUAGES = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();

  const handleChange = async (code: string) => {
    if (code === currentLocale) return;
    document.cookie = `scriptflow-locale=${code};path=/;max-age=${365 * 24 * 60 * 60}`;
    try {
      await fetch('/api/profile/locale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: code }),
      });
    } catch {}
    // Hard navigation clears Next.js RSC cache and fully re-renders with new locale
    window.location.reload();
  };

  return (
    <div className="flex gap-0.5 p-1 bg-[var(--surface-panel)] rounded-md">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
              className={cn(
            'px-2 py-1 text-xs font-mono font-semibold rounded transition-all duration-150',
            currentLocale === lang.code
              ? 'bg-primary text-txt-on-primary shadow-sm'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card',
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
