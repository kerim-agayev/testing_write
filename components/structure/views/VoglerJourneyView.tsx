'use client';

import { useDroppable } from '@dnd-kit/core';
import { ArrowRight } from 'lucide-react';
import type { StructureStage } from '@/lib/structure/data';
import { AssignedSceneChip } from '../AssignedSceneChip';

interface VoglerJourneyViewProps {
  stages: StructureStage[];
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onStageClick: (stageId: string) => void;
}

function JourneyCard({ stage, assignments, locale, onRemove, onClick }: {
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
      className={`flex-shrink-0 w-44 min-h-[140px] flex flex-col rounded-2xl border-2 cursor-pointer transition-all duration-200
        ${isOver ? 'border-dashed scale-[1.02] shadow-md' : 'border-[var(--border-color)] hover:border-opacity-70'}`}
      style={{
        borderColor: isOver ? stage.color : undefined,
        background: isOver ? `${stage.color}10` : 'var(--surface-card)',
      }}
    >
      <div className="p-2.5 border-b border-[var(--border-color)] rounded-t-2xl" style={{ background: stage.colorLight }}>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">#{stage.order}</span>
        <p className="text-xs font-semibold leading-tight mt-0.5" style={{ color: stage.color }}>
          {stage.name[locale]}
        </p>
      </div>
      <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {assignments.map((a: any) => (
          <AssignedSceneChip key={a.id} assignment={a} stageColor={stage.color} onRemove={() => onRemove(a.id)} />
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

export function VoglerJourneyView({ stages, assignments, locale, onRemove, onStageClick }: VoglerJourneyViewProps) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Zone labels */}
      <div className="flex gap-2 min-w-max px-4 mb-2">
        <div className="w-44 text-center">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Ordinary World</span>
        </div>
        <div className="w-4" />
        <div className="flex-1 text-center">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Special World</span>
        </div>
        <div className="w-4" />
        <div className="w-44 text-center">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Return</span>
        </div>
      </div>

      <div className="flex gap-1 min-w-max p-4 items-start">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-start gap-1">
            <JourneyCard
              stage={stage}
              assignments={assignments.filter((a: any) => a.structureStageId === stage.id)}
              locale={locale}
              onRemove={onRemove}
              onClick={() => onStageClick(stage.id)}
            />
            {i < stages.length - 1 && (
              <div className="flex items-center pt-16 px-0.5">
                <ArrowRight size={12} className="text-[var(--text-muted)]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
