'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const LANGUAGES = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
] as const;

export function LanguageSwitcher({ current = 'az' }: { current?: string }) {
  const router = useRouter();

  const handleChange = async (code: string) => {
    document.cookie = `scriptflow-locale=${code};path=/;max-age=${365 * 24 * 60 * 60}`;
    try {
      await fetch('/api/profile/locale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: code }),
      });
    } catch {}
    router.refresh();
  };

  return (
    <div className="flex gap-0.5">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={cn(
            'px-2 py-1 text-xs font-semibold rounded transition-all duration-200',
            current === lang.code
              ? 'bg-primary text-txt-on-primary'
              : 'text-txt-secondary hover:text-txt-primary'
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
