'use client';

import { EMOTIONS } from '@/lib/emotions';

interface Props {
  emotionStart: string | null;
  emotionEnd: string | null;
  onUpdate: (data: { emotionStart?: string | null; emotionEnd?: string | null }) => void;
}

export function SceneEmotionSelector({ emotionStart, emotionEnd, onUpdate }: Props) {
  const startEmo = EMOTIONS.find((e) => e.id === emotionStart);
  const endEmo = EMOTIONS.find((e) => e.id === emotionEnd);

  return (
    <div className="px-3 py-2 border-b border-[var(--border-color)]">
      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
        Emosional Dönüşüm
      </p>
      <div className="flex items-center gap-2">
        <select
          value={emotionStart ?? ''}
          onChange={(e) => onUpdate({ emotionStart: e.target.value || null })}
          className="flex-1 text-xs p-1.5 bg-[var(--surface-base)] border rounded-md focus:border-primary focus:outline-none"
          style={{ borderColor: startEmo?.color ?? undefined }}
        >
          <option value="">Başlanğıc...</option>
          {EMOTIONS.map((em) => (
            <option key={em.id} value={em.id}>{em.az}</option>
          ))}
        </select>

        <span className="text-[var(--text-muted)] text-sm flex-shrink-0">→</span>

        <select
          value={emotionEnd ?? ''}
          onChange={(e) => onUpdate({ emotionEnd: e.target.value || null })}
          className="flex-1 text-xs p-1.5 bg-[var(--surface-base)] border rounded-md focus:border-primary focus:outline-none"
          style={{ borderColor: endEmo?.color ?? undefined }}
        >
          <option value="">Son...</option>
          {EMOTIONS.map((em) => (
            <option key={em.id} value={em.id}>{em.az}</option>
          ))}
        </select>
      </div>

      {startEmo && endEmo && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: `${startEmo.color}25`, color: startEmo.color }}>
            {startEmo.az}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">→</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: `${endEmo.color}25`, color: endEmo.color }}>
            {endEmo.az}
          </span>
        </div>
      )}
    </div>
  );
}
