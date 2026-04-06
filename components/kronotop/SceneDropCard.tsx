'use client';
import { useDroppable } from '@dnd-kit/core';
import { X } from 'lucide-react';
import { KRONOTOPLAR } from '@/lib/kronotop/data';
import { useTranslations, useLocale } from 'next-intl';

type Locale = 'az' | 'en' | 'ru';

interface Props {
  scene: { id: string; sceneNumber: number; intExt: string; timeOfDay?: string | null; location?: { name: string } | null };
  assignedKronotoplar: Array<{ id: string; kronotopId: string }>;
  onRemove: (id: string) => void;
}

export function SceneDropCard({ scene, assignedKronotoplar, onRemove }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id: `scene-${scene.id}`,
    data: { type: 'scene', sceneId: scene.id },
  });
  const t = useTranslations('kronotop.assign');
  const locale = useLocale() as Locale;

  return (
    <div
      ref={setNodeRef}
      className={`p-3 rounded-xl border-2 min-h-[130px] transition-all duration-200 ${isOver ? 'border-dashed border-[var(--color-primary)] bg-[var(--surface-panel)] scale-[1.01] shadow-md' : 'border-[var(--border-color)] bg-[var(--surface-card)]'}`}
    >
      <div className="mb-2.5">
        <p className="text-xs font-mono font-bold text-[var(--text-primary)]">S.{scene.sceneNumber}</p>
        <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
          {scene.intExt}. {scene.location?.name ?? 'MEKAN'} — {scene.timeOfDay ?? 'GÜN'}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {assignedKronotoplar.map(sk => {
          const k = KRONOTOPLAR.find(k => k.id === sk.kronotopId);
          if (!k) return null;
          return (
            <div key={sk.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs group" style={{ background: k.colorLight, color: k.color }}>
              <span>{k.icon}</span>
              <span className="max-w-[72px] truncate font-medium">{k.name[locale]}</span>
              <button
                onClick={e => { e.stopPropagation(); onRemove(sk.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 rounded-full bg-black/15 flex items-center justify-center ml-0.5 hover:bg-black/30"
              >
                <X size={8} />
              </button>
            </div>
          );
        })}
        {assignedKronotoplar.length === 0 && !isOver && (
          <p className="text-[11px] text-[var(--text-muted)] italic">{t('dropHint')}</p>
        )}
        {isOver && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border-2 border-dashed border-[var(--color-primary)] text-[var(--color-primary)]">
            {t('dropActive')}
          </div>
        )}
      </div>
    </div>
  );
}
