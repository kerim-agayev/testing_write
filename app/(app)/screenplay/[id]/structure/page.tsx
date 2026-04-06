'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { STRUCTURE_DEFINITIONS, suggestStructures, type StructureTypeId } from '@/lib/structure/data';
import { StructureWizard } from '@/components/structure/StructureWizard';
import { StructureSelectionCard } from '@/components/structure/StructureSelectionCard';

export default function StructureSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale() as 'az' | 'en' | 'ru';
  const t = useTranslations('storyStructure');

  const [wizardDone, setWizardDone] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);

  const handleWizardSelect = (tags: string[]) => {
    if (tags.length > 0) {
      const suggested = suggestStructures(tags);
      setRecommendedIds(suggested.map((s) => s.id));
    }
    setWizardDone(true);
  };

  const handleStructureSelect = (structureId: string) => {
    router.push(`/screenplay/${id}/structure/${structureId}`);
  };

  const allStructures = Object.values(STRUCTURE_DEFINITIONS);

  // Sort recommended first
  const sortedStructures = [...allStructures].sort((a, b) => {
    const aRec = recommendedIds.includes(a.id) ? 0 : 1;
    const bRec = recommendedIds.includes(b.id) ? 0 : 1;
    if (aRec !== bRec) return aRec - bRec;
    return a.difficulty - b.difficulty;
  });

  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('selectTitle')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">{t('selectSubtitle')}</p>

        {!wizardDone ? (
          <StructureWizard locale={locale} onSelect={handleWizardSelect} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedStructures.map((structure) => (
              <StructureSelectionCard
                key={structure.id}
                structure={structure}
                isRecommended={recommendedIds.includes(structure.id)}
                locale={locale}
                onSelect={handleStructureSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
