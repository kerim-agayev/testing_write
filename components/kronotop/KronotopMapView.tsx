'use client';
import { KRONOTOPLAR } from '@/lib/kronotop/data';
import { useLocale, useTranslations } from 'next-intl';

type Locale = 'az' | 'en' | 'ru';

interface Props {
  scenes: Array<{ id: string; sceneNumber: number; intExt: string; timeOfDay?: string | null; location?: { name: string } | null }>;
  assignments: Array<{ id: string; sceneId: string; kronotopId: string }>;
}

export function KronotopMapView({ scenes, assignments }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations('kronotop.map');

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <p className="text-sm text-[var(--text-muted)] mb-4">{t('description')}</p>
      <div className="space-y-2">
        {scenes.map(scene => {
          const sceneAssignments = assignments.filter(a => a.sceneId === scene.id);
          return (
            <div key={scene.id} className="flex items-start gap-4 p-3 bg-[var(--surface-card)] border border-[var(--border-color)] rounded-lg">
              <div className="flex-shrink-0 w-40">
                <p className="text-xs font-mono font-bold">S.{scene.sceneNumber}</p>
                <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                  {scene.intExt}. {scene.location?.name ?? ''} — {scene.timeOfDay}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sceneAssignments.length === 0 ? (
                  <span className="text-xs text-[var(--text-muted)] italic">—</span>
                ) : sceneAssignments.map(a => {
                  const k = KRONOTOPLAR.find(k => k.id === a.kronotopId);
                  if (!k) return null;
                  return (
                    <span key={a.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: k.colorLight, color: k.color }}>
                      {k.icon} {k.name[locale]}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
