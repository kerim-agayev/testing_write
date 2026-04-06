'use client';
import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { KRONOTOPLAR, KRONOTOP_CATEGORIES, type KronotopData } from '@/lib/kronotop/data';
import { useTranslations, useLocale } from 'next-intl';

type Locale = 'az' | 'en' | 'ru';

function PaletteItem({ kronotop, locale }: { kronotop: KronotopData; locale: Locale }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${kronotop.id}`,
    data: { type: 'kronotop', kronotopId: kronotop.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-sm'}`}
      style={{
        borderColor: `${kronotop.color}50`,
        background: isDragging ? kronotop.colorLight : 'var(--surface-card)',
      }}
    >
      <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
        <img src={kronotop.svgPath} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-[var(--text-primary)]">{kronotop.name[locale]}</p>
        <p className="text-[10px] text-[var(--text-muted)] truncate">{kronotop.filmExamples[0]}</p>
      </div>
      <GripVertical size={12} className="flex-shrink-0 text-[var(--text-muted)] opacity-50" />
    </div>
  );
}

export function KronotopPalette() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const t = useTranslations('kronotop');
  const locale = useLocale() as Locale;

  const filtered = KRONOTOPLAR.filter(k => {
    const matchCat = activeCategory === 'all' || k.category === activeCategory;
    const matchSearch = !search || k.name.az.toLowerCase().includes(search.toLowerCase()) ||
                        k.name.en.toLowerCase().includes(search.toLowerCase()) ||
                        k.name.ru.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = [
    { id: 'all', label: t('categories.all') },
    { id: 'klasik', label: t('categories.klasik') },
    { id: 'tematik', label: t('categories.tematik') },
    { id: 'mikro', label: t('categories.mikro') },
    { id: 'muasir', label: t('categories.muasir') },
  ];

  return (
    <div className="w-72 flex-shrink-0 border-r border-[var(--border-color)] flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{t('assign.paletteTitle')}</h3>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('assign.search')}
          className="w-full text-xs p-2 bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md focus:border-[var(--color-primary)] focus:outline-none mb-3"
        />
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${activeCategory === cat.id ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filtered.map(k => <PaletteItem key={k.id} kronotop={k} locale={locale} />)}
        {filtered.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] italic text-center py-4">{t('assign.noResults')}</p>
        )}
      </div>
      <div className="p-3 border-t border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-muted)] text-center">{t('assign.dragHint')}</p>
      </div>
    </div>
  );
}
