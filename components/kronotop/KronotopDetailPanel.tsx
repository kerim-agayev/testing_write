'use client';
import { X } from 'lucide-react';
import type { KronotopData } from '@/lib/kronotop/data';
import { KRONOTOP_CATEGORIES } from '@/lib/kronotop/data';
import { useTranslations } from 'next-intl';

type Locale = 'az' | 'en' | 'ru';

interface Props {
  kronotop: KronotopData;
  locale: Locale;
  onClose: () => void;
}

function DetailSection({ title, icon, color, content }: { title: string; icon: string; color: string; content: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color }}>{title}</h3>
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{content}</p>
    </div>
  );
}

export function KronotopDetailPanel({ kronotop, locale, onClose }: Props) {
  const t = useTranslations('kronotop.detail');

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[640px] bg-[var(--surface-card)] border-l border-[var(--border-color)] shadow-2xl z-40 overflow-y-auto">
        <div className="relative" style={{ background: kronotop.colorLight }}>
          <img src={kronotop.svgPath} alt={kronotop.name[locale]} className="w-full aspect-video object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-xs font-mono mb-1 opacity-70 text-white">
              {KRONOTOP_CATEGORIES[kronotop.category][locale]}
            </p>
            <h2 className="text-xl font-bold text-white">
              {kronotop.icon} {kronotop.name[locale]}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DetailSection title={t('whatItIs')} icon="✅" color={kronotop.color} content={kronotop.whatItIs[locale]} />
          <DetailSection title={t('whatItIsNot')} icon="❌" color="#C0392B" content={kronotop.whatItIsNot[locale]} />
          <DetailSection title={t('howToUse')} icon="🎬" color={kronotop.color} content={kronotop.howToUse[locale]} />
          <DetailSection title={t('importance')} icon="⚡" color="#E67E22" content={kronotop.importance[locale]} />

          <div className="p-4 rounded-xl border-l-4" style={{ borderColor: kronotop.color, background: kronotop.colorLight }}>
            <p className="text-xs font-semibold mb-1.5" style={{ color: kronotop.color }}>
              💡 {t('tip')}
            </p>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {kronotop.scenaristTip[locale]}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2.5">
              {t('examples')}
            </p>
            <div className="flex flex-wrap gap-2">
              {kronotop.filmExamples.map(film => (
                <span key={film} className="px-3 py-1.5 bg-[var(--surface-panel)] border border-[var(--border-color)] rounded-full text-sm text-[var(--text-secondary)]">
                  🎬 {film}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
