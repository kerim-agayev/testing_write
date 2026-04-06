'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { KRONOTOPLAR } from '@/lib/kronotop/data';

interface Props {
  sceneId: string | null;
  screenplayId: string;
}

export function SceneKronotopBadges({ sceneId, screenplayId }: Props) {
  const router = useRouter();
  const { data: assignments = [] } = useQuery({
    queryKey: ['scene-kronotop', sceneId],
    queryFn: async () => {
      if (!sceneId) return [];
      const res = await fetch(`/api/screenplays/${screenplayId}/kronotop?sceneId=${sceneId}`);
      return res.json();
    },
    enabled: !!sceneId,
  });

  if (!sceneId || assignments.length === 0) return null;

  return (
    <div className="px-3 py-2 border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Xronotoplar
        </p>
        <button
          onClick={() => router.push(`/screenplay/${screenplayId}/kronotop`)}
          className="text-[10px] text-[var(--color-primary)] hover:underline"
        >
          düzənlə →
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {assignments.map((a: { id: string; kronotopId: string }) => {
          const k = KRONOTOPLAR.find(k => k.id === a.kronotopId);
          if (!k) return null;
          return (
            <span
              key={a.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full cursor-default"
              style={{ background: k.colorLight, color: k.color }}
              title={k.name.az}
            >
              {k.icon}
            </span>
          );
        })}
      </div>
    </div>
  );
}
