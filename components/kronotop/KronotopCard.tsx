'use client';
import type { KronotopData } from '@/lib/kronotop/data';
import { KRONOTOP_CATEGORIES } from '@/lib/kronotop/data';

type Locale = 'az' | 'en' | 'ru';

interface KronotopCardProps {
  kronotop: KronotopData;
  onClick: (k: KronotopData) => void;
  isSelected: boolean;
  locale: Locale;
}

export function KronotopCard({ kronotop, onClick, isSelected, locale }: KronotopCardProps) {
  return (
    <div
      onClick={() => onClick(kronotop)}
      className={`rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
      style={{
        borderColor: `${kronotop.color}40`,
        '--tw-ring-color': kronotop.color,
      } as React.CSSProperties}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={kronotop.svgPath}
          alt={kronotop.name[locale]}
          className="w-full h-full object-cover"
        />
        <span
          className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}
        >
          {KRONOTOP_CATEGORIES[kronotop.category][locale]}
        </span>
        <span className="absolute top-3 right-3 text-xl">{kronotop.icon}</span>
      </div>
      <div className="p-4" style={{ background: kronotop.colorLight }}>
        <h3 className="font-semibold text-sm mb-1.5" style={{ color: kronotop.color }}>
          {kronotop.name[locale]}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
          {kronotop.shortDesc[locale]}
        </p>
        <div className="flex flex-wrap gap-1">
          {kronotop.filmExamples.slice(0, 2).map(film => (
            <span key={film} className="text-[10px] px-1.5 py-0.5 bg-white/60 rounded text-[var(--text-muted)]">
              {film}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
