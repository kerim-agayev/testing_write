'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { KRONOTOPLAR, KRONOTOP_CATEGORIES, type KronotopData, type KronotopCategory } from '@/lib/kronotop/data';
import { KronotopCard } from '@/components/kronotop/KronotopCard';
import { KronotopDetailPanel } from '@/components/kronotop/KronotopDetailPanel';

type Locale = 'az' | 'en' | 'ru';

export default function KronotopDiscoveryPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('kronotop');
  const [selectedKronotop, setSelectedKronotop] = useState<KronotopData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? KRONOTOPLAR
    : KRONOTOPLAR.filter(k => k.category === activeCategory);

  const categories = [
    { id: 'all', label: t('categories.all'), count: KRONOTOPLAR.length },
    { id: 'klasik', label: t('categories.klasik'), count: KRONOTOPLAR.filter(k => k.category === 'klasik').length },
    { id: 'tematik', label: t('categories.tematik'), count: KRONOTOPLAR.filter(k => k.category === 'tematik').length },
    { id: 'mikro', label: t('categories.mikro'), count: KRONOTOPLAR.filter(k => k.category === 'mikro').length },
    { id: 'muasir', label: t('categories.muasir'), count: KRONOTOPLAR.filter(k => k.category === 'muasir').length },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{t('title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">{t('subtitle')}</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-3">
            {t('intro1')}
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            {t('intro2')}
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--surface-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
              }`}
            >
              {cat.label} <span className="opacity-70">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(k => (
            <KronotopCard
              key={k.id}
              kronotop={k}
              onClick={setSelectedKronotop}
              isSelected={selectedKronotop?.id === k.id}
              locale={locale}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedKronotop && (
        <KronotopDetailPanel
          kronotop={selectedKronotop}
          locale={locale}
          onClose={() => setSelectedKronotop(null)}
        />
      )}
    </div>
  );
}
