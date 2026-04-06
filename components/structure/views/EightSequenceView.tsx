'use client';

import { useDroppable } from '@dnd-kit/core';
import type { StructureStage } from '@/lib/structure/data';
import { AssignedSceneChip } from '../AssignedSceneChip';

interface EightSequenceViewProps {
  stages: StructureStage[];
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onStageClick: (stageId: string) => void;
}

function SeqColumn({ stage, assignments, locale, onRemove, onClick }: {
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
      className={`flex-1 min-w-[120px] min-h-[350px] flex flex-col rounded-xl border-2 cursor-pointer transition-all duration-200
        ${isOver ? 'border-dashed scale-[1.01] shadow-md' : 'border-[var(--border-color)] hover:border-opacity-60'}`}
      style={{
        borderColor: isOver ? stage.color : undefined,
        background: isOver ? `${stage.color}10` : 'var(--surface-card)',
      }}
    >
      <div className="p-2.5 border-b border-[var(--border-color)] rounded-t-xl" style={{ background: `${stage.color}15` }}>
        <p className="text-[10px] font-semibold" style={{ color: stage.color }}>
          {stage.name[locale]}
        </p>
        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{assignments.length}</p>
      </div>
      <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
        {assignments.map((a: any) => (
          <AssignedSceneChip key={a.id} assignment={a} stageColor={stage.color} onRemove={() => onRemove(a.id)} />
        ))}
        {assignments.length === 0 && !isOver && (
          <p className="text-[9px] text-[var(--text-muted)] italic text-center pt-3">
            {locale === 'az' ? 'sürüklə' : locale === 'ru' ? 'перетащите' : 'drag'}
          </p>
        )}
      </div>
    </div>
  );
}

export function EightSequenceView({ stages, assignments, locale, onRemove, onStageClick }: EightSequenceViewProps) {
  return (
    <div className="space-y-3">
      {/* Act info bar */}
      <div className="flex gap-1 text-[10px] text-[var(--text-muted)] font-medium">
        <div className="flex-[2] text-center py-1 rounded bg-[var(--surface-panel)]">
          {locale === 'az' ? 'Sekans 1-2 = Pərdə 1' : locale === 'ru' ? 'Секция 1-2 = Акт 1' : 'Seq 1-2 = Act 1'}
        </div>
        <div className="flex-[4] text-center py-1 rounded bg-[var(--surface-panel)]">
          {locale === 'az' ? 'Sekans 3-6 = Pərdə 2' : locale === 'ru' ? 'Секция 3-6 = Акт 2' : 'Seq 3-6 = Act 2'}
        </div>
        <div className="flex-[2] text-center py-1 rounded bg-[var(--surface-panel)]">
          {locale === 'az' ? 'Sekans 7-8 = Pərdə 3' : locale === 'ru' ? 'Секция 7-8 = Акт 3' : 'Seq 7-8 = Act 3'}
        </div>
      </div>

      <div className="flex gap-2">
        {stages.map((stage) => (
          <SeqColumn
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
