'use client';

import { useTranslations } from 'next-intl';
import type { StructureDefinition } from '@/lib/structure/data';

interface StructureSelectionCardProps {
  structure: StructureDefinition;
  isRecommended: boolean;
  locale: 'az' | 'en' | 'ru';
  onSelect: (id: string) => void;
}

export function StructureSelectionCard({ structure, isRecommended, locale, onSelect }: StructureSelectionCardProps) {
  const t = useTranslations('storyStructure.card');

  return (
    <div
      onClick={() => onSelect(structure.id)}
      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
        ${isRecommended
          ? 'border-[var(--color-primary)] bg-[var(--surface-card)] ring-1 ring-[var(--color-primary)] ring-offset-1'
          : 'border-[var(--border-color)] bg-[var(--surface-card)] hover:border-[var(--color-primary)]'
        }`}
    >
      {isRecommended && (
        <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-[var(--color-primary)] text-white text-xs font-medium rounded-full">
          ★ {t('recommended')}
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[var(--text-primary)] text-sm">
          {structure.name[locale]}
        </h3>
        <div className="flex gap-0.5 ml-2 mt-0.5 flex-shrink-0">
          {[1, 2, 3].map((d) => (
            <div
              key={d}
              className={`w-2 h-2 rounded-full ${
                d <= structure.difficulty ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-color)]'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
        {structure.shortDesc[locale]}
      </p>

      <div className="space-y-1.5">
        {structure.filmExamples.slice(0, 2).map((ex) => (
          <div key={ex.title} className="flex items-start gap-2">
            <span className="text-xs font-medium text-[var(--color-primary)] whitespace-nowrap">
              {ex.title}
            </span>
            <span className="text-xs text-[var(--text-muted)] leading-tight">{ex.why}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-muted)]">
          {t('bestFor')}{' '}
          <span className="text-[var(--text-secondary)]">{structure.bestFor[locale]}</span>
        </p>
      </div>
    </div>
  );
}
