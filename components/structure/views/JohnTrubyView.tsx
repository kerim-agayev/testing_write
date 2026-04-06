'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import type { StructureStage } from '@/lib/structure/data';
import { AssignedSceneChip } from '../AssignedSceneChip';

interface JohnTrubyViewProps {
  stages: StructureStage[];
  assignments: any[];
  scenes: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onAssign: (sceneId: string, stageId: string) => void;
  onStageClick: (stageId: string) => void;
}

export function JohnTrubyView({ stages, assignments, scenes, locale, onRemove, onAssign, onStageClick }: JohnTrubyViewProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set(stages.filter((_, i) => i < 5).map(s => s.id))
  );
  const [modalStageId, setModalStageId] = useState<string | null>(null);

  const toggleExpand = (stageId: string) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  const assignedSceneIds = new Set(assignments.map((a: any) => a.sceneId));

  return (
    <div className="space-y-2 p-4 max-w-3xl mx-auto">
      {stages.map((stage) => {
        const stageAssignments = assignments.filter((a: any) => a.structureStageId === stage.id);
        const isExpanded = expandedStages.has(stage.id);

        return (
          <div key={stage.id} className="border border-[var(--border-color)] rounded-xl bg-[var(--surface-card)] overflow-hidden">
            <button
              onClick={() => { toggleExpand(stage.id); onStageClick(stage.id); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-[var(--surface-hover)] transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} className="text-[var(--text-muted)]" /> : <ChevronRight size={14} className="text-[var(--text-muted)]" />}
              <span className="text-[10px] font-mono text-[var(--text-muted)] w-5">{stage.order}</span>
              <span className="text-xs font-semibold flex-1 text-left" style={{ color: stage.color }}>
                {stage.name[locale]}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {stageAssignments.length}
              </span>
              <div className="w-2 h-2 rounded-full" style={{ background: stageAssignments.length > 0 ? stage.color : 'var(--border-color)' }} />
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 pt-1 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">
                  {stage.description[locale]}
                </p>
                <div className="space-y-1 mb-2">
                  {stageAssignments.map((a: any) => (
                    <AssignedSceneChip key={a.id} assignment={a} stageColor={stage.color} onRemove={() => onRemove(a.id)} />
                  ))}
                </div>
                <button
                  onClick={() => setModalStageId(stage.id)}
                  className="flex items-center gap-1.5 text-[10px] font-medium py-1 px-2 rounded-md hover:bg-[var(--surface-panel)] transition-colors"
                  style={{ color: stage.color }}
                >
                  <Plus size={10} />
                  {locale === 'az' ? 'Səhnə əlavə et' : locale === 'ru' ? 'Добавить сцену' : 'Add scene'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Scene selection modal */}
      {modalStageId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModalStageId(null)}>
          <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--border-color)] shadow-lg w-80 max-h-96 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {locale === 'az' ? 'Səhnə seçin' : locale === 'ru' ? 'Выберите сцену' : 'Select scene'}
              </p>
              <button onClick={() => setModalStageId(null)}>
                <X size={14} className="text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-72 p-2 space-y-1">
              {scenes.filter((s: any) => !assignedSceneIds.has(s.id)).map((scene: any) => (
                <button
                  key={scene.id}
                  onClick={() => { onAssign(scene.id, modalStageId); setModalStageId(null); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-left"
                >
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-5">{scene.sceneNumber}</span>
                  <span className="text-xs text-[var(--text-primary)] truncate">{scene.intExt}. {scene.location?.name ?? '—'}</span>
                </button>
              ))}
              {scenes.filter((s: any) => !assignedSceneIds.has(s.id)).length === 0 && (
                <p className="text-xs text-[var(--text-muted)] text-center py-4 italic">
                  {locale === 'az' ? 'Bütün səhnələr atanıb' : locale === 'ru' ? 'Все сцены назначены' : 'All scenes assigned'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
