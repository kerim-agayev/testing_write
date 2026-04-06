'use client';

import { useDroppable } from '@dnd-kit/core';
import type { StructureStage } from '@/lib/structure/data';
import { AssignedSceneChip } from '../AssignedSceneChip';

interface ThreeActViewProps {
  stages: StructureStage[];
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onStageClick: (stageId: string) => void;
}

function StageColumn({ stage, assignments, locale, onRemove, onStageClick }: {
  stage: StructureStage;
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onStageClick: (stageId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stage.id}`,
    data: { type: 'stage', stageId: stage.id },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onStageClick(stage.id)}
      className={`flex flex-col rounded-xl border-2 transition-all duration-200 min-h-[400px] cursor-pointer
        ${isOver ? 'border-dashed scale-[1.01] shadow-md' : 'border-[var(--border-color)] hover:border-opacity-60'}`}
      style={{
        borderColor: isOver ? stage.color : undefined,
        background: isOver ? `${stage.color}10` : 'var(--surface-card)',
        flex: stage.id === 'midpoint' ? 1 : 2,
      }}
    >
      <div
        className="p-3 border-b border-[var(--border-color)] rounded-t-xl"
        style={{ background: `${stage.color}15` }}
      >
        <p className="text-xs font-semibold" style={{ color: stage.color }}>
          {stage.name[locale]}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          {assignments.length} {locale === 'az' ? 'səhnə' : locale === 'ru' ? 'сцен' : 'scenes'}
        </p>
      </div>

      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        {assignments.map((a: any) => (
          <AssignedSceneChip
            key={a.id}
            assignment={a}
            stageColor={stage.color}
            onRemove={() => onRemove(a.id)}
          />
        ))}
        {assignments.length === 0 && !isOver && (
          <p className="text-[11px] text-[var(--text-muted)] italic text-center py-4">
            {locale === 'az' ? 'Səhnə sürükləyin...' : locale === 'ru' ? 'Перетащите сцены...' : 'Drag scenes here...'}
          </p>
        )}
        {isOver && (
          <div
            className="flex items-center justify-center py-3 rounded-lg border-2 border-dashed text-xs font-medium"
            style={{ borderColor: stage.color, color: stage.color }}
          >
            + {locale === 'az' ? 'Bura burax' : locale === 'ru' ? 'Бросьте здесь' : 'Drop here'}
          </div>
        )}
      </div>
    </div>
  );
}

export function ThreeActView({ stages, assignments, locale, onRemove, onStageClick }: ThreeActViewProps) {
  return (
    <div className="flex gap-3 h-full">
      {stages.map((stage) => (
        <StageColumn
          key={stage.id}
          stage={stage}
          assignments={assignments.filter((a: any) => a.structureStageId === stage.id)}
          locale={locale}
          onRemove={onRemove}
          onStageClick={onStageClick}
        />
      ))}
    </div>
  );
}
