'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { STRUCTURE_DEFINITIONS, type StructureTypeId } from '@/lib/structure/data';
import { DraggableSceneItem } from '@/components/structure/StructureSceneList';
import { StageDetailPanel } from '@/components/structure/StageDetailPanel';
import { AnalysisView } from '@/components/structure/AnalysisView';
import { ThreeActView } from '@/components/structure/views/ThreeActView';
import { SaveTheCatView } from '@/components/structure/views/SaveTheCatView';
import { DanHarmonCircleView } from '@/components/structure/views/DanHarmonCircleView';
import { VoglerJourneyView } from '@/components/structure/views/VoglerJourneyView';
import { JohnTrubyView } from '@/components/structure/views/JohnTrubyView';
import { EightSequenceView } from '@/components/structure/views/EightSequenceView';

export default function StructureWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const type = params.type as string;
  const locale = useLocale() as 'az' | 'en' | 'ru';
  const t = useTranslations('storyStructure');
  const qc = useQueryClient();

  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workspace' | 'analysis'>('workspace');

  const structureDef = STRUCTURE_DEFINITIONS[type as StructureTypeId];

  // Fetch scenes
  const { data: scenes = [] } = useQuery({
    queryKey: ['scenes', id],
    queryFn: () => fetch(`/api/screenplays/${id}/scenes`).then((r) => r.json()),
  });

  // Fetch or create structure record
  const { data: screenplayStructure } = useQuery({
    queryKey: ['structure', id, type],
    queryFn: () =>
      fetch(`/api/screenplays/${id}/structure?type=${type.toUpperCase()}`).then((r) => r.json()),
  });

  // Fetch assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['structure-assignments', screenplayStructure?.id],
    queryFn: () =>
      fetch(`/api/structure/${screenplayStructure?.id}/assignments`).then((r) => r.json()),
    enabled: !!screenplayStructure?.id,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ sceneId, stageId }: { sceneId: string; stageId: string }) => {
      const res = await fetch(`/api/structure/${screenplayStructure?.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, structureStageId: stageId }),
      });
      if (res.status === 409) return;
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['structure-assignments', screenplayStructure?.id] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (aid: string) => {
      await fetch(`/api/structure/${screenplayStructure?.id}/assignments/${aid}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['structure-assignments', screenplayStructure?.id] }),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !screenplayStructure) return;
    if (active.data.current?.type === 'scene' && over.data.current?.type === 'stage') {
      assignMutation.mutate({
        sceneId: active.data.current.sceneId,
        stageId: over.data.current.stageId,
      });
    }
  };

  const handleRemove = (aid: string) => removeMutation.mutate(aid);

  const handleAssign = (sceneId: string, stageId: string) => {
    assignMutation.mutate({ sceneId, stageId });
  };

  if (!structureDef) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-[var(--text-muted)]">Structure not found</p>
      </div>
    );
  }

  const renderView = () => {
    const commonProps = {
      stages: structureDef.stages,
      assignments,
      locale,
      onRemove: handleRemove,
      onStageClick: setActiveStageId,
    };

    switch (type) {
      case 'three_act':
        return <ThreeActView {...commonProps} />;
      case 'save_the_cat':
        return <SaveTheCatView {...commonProps} />;
      case 'dan_harmon':
        return <DanHarmonCircleView {...commonProps} />;
      case 'vogler':
        return <VoglerJourneyView {...commonProps} />;
      case 'john_truby':
        return <JohnTrubyView {...commonProps} scenes={scenes} onAssign={handleAssign} />;
      case 'eight_sequence':
        return <EightSequenceView {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-[var(--border-color)] px-6 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/screenplay/${id}/structure`}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              ← {t('workspace.back')}
            </Link>
            <h1 className="text-base font-semibold text-[var(--text-primary)]">
              {structureDef.name[locale]}
            </h1>
          </div>
        </div>
        <div className="flex gap-0">
          {(['workspace', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {t(`workspace.${tab === 'workspace' ? 'title' : 'analysis' as any}`)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'workspace' && (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex flex-1 overflow-hidden">
            {/* Left panel — scenes */}
            <div className="w-60 flex-shrink-0 border-r border-[var(--border-color)] overflow-y-auto p-3 space-y-1.5">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide px-1 mb-2">
                {t('workspace.scenes')}
              </p>
              {scenes.map((s: any) => (
                <DraggableSceneItem
                  key={s.id}
                  scene={s}
                  isAssigned={assignments.some((a: any) => a.sceneId === s.id)}
                />
              ))}
              {scenes.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] italic text-center py-4">
                  {locale === 'az' ? 'Səhnə yoxdur' : locale === 'ru' ? 'Нет сцен' : 'No scenes yet'}
                </p>
              )}
            </div>

            {/* Center — structure view */}
            <div className="flex-1 overflow-auto p-6">{renderView()}</div>

            {/* Right panel — stage detail */}
            <div className="w-72 flex-shrink-0 border-l border-[var(--border-color)] overflow-y-auto">
              <StageDetailPanel
                stage={structureDef.stages.find((s) => s.id === activeStageId) ?? null}
                locale={locale}
                assignmentCount={
                  assignments.filter((a: any) => a.structureStageId === activeStageId).length
                }
              />
            </div>
          </div>
        </DndContext>
      )}

      {activeTab === 'analysis' && (
        <AnalysisView
          structureType={type.toUpperCase()}
          stages={structureDef.stages}
          assignments={assignments}
          locale={locale}
        />
      )}
    </div>
  );
}
