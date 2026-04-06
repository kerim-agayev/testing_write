'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface StructureWizardProps {
  locale: 'az' | 'en' | 'ru';
  onSelect: (tags: string[]) => void;
}

const WIZARD_QUESTIONS = [
  {
    id: 'format',
    questionKey: 'format',
    options: [
      { value: 'feature', labelKey: 'feature' },
      { value: 'tv', labelKey: 'tv' },
      { value: 'short', labelKey: 'short' },
    ],
  },
  {
    id: 'focus',
    questionKey: 'focus',
    options: [
      { value: 'character_driven', labelKey: 'characterDriven' },
      { value: 'commercial', labelKey: 'commercial' },
      { value: 'mythology', labelKey: 'mythology' },
    ],
  },
  {
    id: 'experience',
    questionKey: 'experience',
    options: [
      { value: 'beginner', labelKey: 'beginner' },
      { value: 'intermediate', labelKey: 'intermediate' },
      { value: 'advanced', labelKey: 'advanced' },
    ],
  },
];

export function StructureWizard({ locale, onSelect }: StructureWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const t = useTranslations('storyStructure.wizard');

  const handleAnswer = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (step < WIZARD_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onSelect(Object.values(next));
    }
  };

  const q = WIZARD_QUESTIONS[step];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex gap-2 mb-8">
        {WIZARD_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-color)]'
            }`}
          />
        ))}
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
        {t(q.questionKey)}
      </h2>
      <div className="space-y-3">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(q.id, opt.value)}
            className="w-full text-left p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-card)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all text-sm text-[var(--text-primary)]"
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSelect([])}
        className="w-full mt-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] py-2"
      >
        {t('skipWizard')}
      </button>
    </div>
  );
}
