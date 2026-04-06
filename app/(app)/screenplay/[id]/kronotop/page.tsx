'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { KRONOTOPLAR } from '@/lib/kronotop/data';
import { KronotopPalette } from '@/components/kronotop/KronotopPalette';
import { SceneDropCard } from '@/components/kronotop/SceneDropCard';
import { KronotopStatsView } from '@/components/kronotop/KronotopStatsView';
import { KronotopMapView } from '@/components/kronotop/KronotopMapView';

type PageTab = 'atama' | 'xerite' | 'statistika';

export default function KronotopPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<PageTab>('atama');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const qc = useQueryClient();
  const t = useTranslations('kronotop');

  const { data: scenes = [] } = useQuery({
    queryKey: ['scenes', id],
    queryFn: () => fetch(`/api/screenplays/${id}/scenes`).then(r => r.json()),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['kronotop-assignments', id],
    queryFn: async () => {
      const res = await fetch(`/api/screenplays/${id}/kronotop`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['kronotop-stats', id],
    queryFn: () => fetch(`/api/screenplays/${id}/kronotop/stats`).then(r => r.json()),
    enabled: activeTab === 'statistika',
  });

  const assignMutation = useMutation({
    mutationFn: async ({ sceneId, kronotopId }: { sceneId: string; kronotopId: string }) => {
      const res = await fetch(`/api/screenplays/${id}/kronotop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, kronotopId }),
      });
      if (res.status === 409) return;
      if (!res.ok) throw new Error('Assignment failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kronotop-assignments', id] });
      qc.invalidateQueries({ queryKey: ['kronotop-stats', id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await fetch(`/api/screenplays/${id}/kronotop/${assignmentId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kronotop-assignments', id] });
      qc.invalidateQueries({ queryKey: ['kronotop-stats', id] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;
    if (active.data.current?.type === 'kronotop' && over.data.current?.type === 'scene') {
      assignMutation.mutate({
        sceneId: over.data.current.sceneId as string,
        kronotopId: active.data.current.kronotopId as string,
      });
    }
  };

  const tabs = [
    { id: 'atama' as const, label: t('tabs.atama') },
    { id: 'xerite' as const, label: t('tabs.xerite') },
    { id: 'statistika' as const, label: t('tabs.statistika') },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Tab bar */}
      <div className="flex-shrink-0 px-4 pt-4 border-b border-[var(--border-color)] bg-[var(--surface-card)]">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment tab */}
      {activeTab === 'atama' && (
        <DndContext
          onDragStart={e => setActiveDragId(String(e.active.id))}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 overflow-hidden">
            <KronotopPalette />
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scenes.map((scene: { id: string; sceneNumber: number; intExt: string; timeOfDay?: string | null; location?: { name: string } | null }) => (
                  <SceneDropCard
                    key={scene.id}
                    scene={scene}
                    assignedKronotoplar={assignments.filter((a: { sceneId: string }) => a.sceneId === scene.id)}
                    onRemove={aid => removeMutation.mutate(aid)}
                  />
                ))}
              </div>
              {scenes.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-sm text-[var(--text-muted)]">No scenes yet. Add scenes in the editor first.</p>
                </div>
              )}
            </div>
          </div>
          <DragOverlay dropAnimation={{ duration: 200 }}>
            {activeDragId && (() => {
              const k = KRONOTOPLAR.find(k => `palette-${k.id}` === activeDragId);
              return k ? (
                <div className="px-3 py-2 rounded-lg border shadow-lg text-xs font-medium bg-[var(--surface-card)] border-[var(--color-primary)] text-[var(--color-primary)]">
                  {k.icon} {k.name.az}
                </div>
              ) : null;
            })()}
          </DragOverlay>
        </DndContext>
      )}

      {/* Map tab */}
      {activeTab === 'xerite' && (
        <KronotopMapView scenes={scenes} assignments={assignments} />
      )}

      {/* Stats tab */}
      {activeTab === 'statistika' && (
        <KronotopStatsView stats={stats} />
      )}
    </div>
  );
}
