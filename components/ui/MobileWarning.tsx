'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function MobileWarning() {
  const [show, setShow] = useState(false);
  const t = useTranslations('common.mobileWarning');

  useEffect(() => {
    if (window.innerWidth < 1024) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">
      <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-5">💻</div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          {t('title')}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          {t('message')}
        </p>
        <button
          onClick={() => setShow(false)}
          className="w-full py-2.5 text-sm border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-panel)] transition-colors"
        >
          {t('continue')}
        </button>
      </div>
    </div>
  );
}
