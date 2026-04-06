'use client';

import { useDroppable } from '@dnd-kit/core';
import type { StructureStage } from '@/lib/structure/data';
import { AssignedSceneChip } from '../AssignedSceneChip';

interface SaveTheCatViewProps {
  stages: StructureStage[];
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onStageClick: (stageId: string) => void;
}

function SaveTheCatBeat({ stage, assignments, locale, onRemove, onClick }: {
  stage: StructureStage;
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onClick: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stage.id}`,
    data: { type: 'stage', stageId: stage.id },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`w-40 min-h-[160px] flex flex-col rounded-xl border-2 cursor-pointer transition-all duration-200
        ${isOver ? 'border-dashed scale-[1.02] shadow-md' : 'border-[var(--border-color)] hover:border-opacity-70'}`}
      style={{
        borderColor: isOver ? stage.color : undefined,
        background: isOver ? `${stage.color}10` : 'var(--surface-card)',
      }}
    >
      <div className="p-2.5 border-b border-[var(--border-color)]" style={{ background: stage.colorLight }}>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">#{stage.order}</span>
        <p className="text-xs font-semibold leading-tight mt-0.5" style={{ color: stage.color }}>
          {stage.name[locale]}
        </p>
      </div>

      <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {assignments.map((a: any) => (
          <AssignedSceneChip
            key={a.id}
            assignment={a}
            stageColor={stage.color}
            onRemove={() => onRemove(a.id)}
          />
        ))}
        {assignments.length === 0 && !isOver && (
          <p className="text-[10px] text-[var(--text-muted)] italic text-center pt-2">
            {locale === 'az' ? 'sürüklə' : locale === 'ru' ? 'перетащите' : 'drag'}
          </p>
        )}
      </div>
    </div>
  );
}

export function SaveTheCatView({ stages, assignments, locale, onRemove, onStageClick }: SaveTheCatViewProps) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-2 min-w-max p-4">
        {stages.map((stage) => (
          <SaveTheCatBeat
            key={stage.id}
            stage={stage}
            assignments={assignments.filter((a: any) => a.structureStageId === stage.id)}
            locale={locale}
            onRemove={onRemove}
            onClick={() => onStageClick(stage.id)}
          />
        ))}
      </div>
    </div>
  );
}
