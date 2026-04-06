'use client';

import { useTranslations } from 'next-intl';
import type { StructureStage } from '@/lib/structure/data';

interface StageDetailPanelProps {
  stage: StructureStage | null;
  locale: 'az' | 'en' | 'ru';
  assignmentCount: number;
}

export function StageDetailPanel({ stage, locale, assignmentCount }: StageDetailPanelProps) {
  const t = useTranslations('storyStructure.stageDetail');

  if (!stage) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <p className="text-xs text-[var(--text-muted)] italic text-center">
          {t('clickStage')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto h-full space-y-5">
      <div className="p-3 rounded-xl" style={{ background: stage.colorLight }}>
        <p className="text-sm font-semibold" style={{ color: stage.color }}>
          {stage.name[locale]}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
          {stage.description[locale]}
        </p>
      </div>

      <div className="p-3 bg-[var(--surface-panel)] rounded-lg border border-[var(--border-color)]">
        <p className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-wide mb-1.5">
          {t('keyQuestion')}
        </p>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          {stage.keyQuestion[locale]}
        </p>
      </div>

      <div className="flex items-center justify-between py-2 border-t border-[var(--border-color)]">
        <span className="text-xs text-[var(--text-muted)]">
          {t('inThisStage')}
        </span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
          {assignmentCount} {t('scenes')}
        </span>
      </div>
    </div>
  );
}
