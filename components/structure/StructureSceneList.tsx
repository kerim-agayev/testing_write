'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

interface SceneItem {
  id: string;
  sceneNumber: number;
  intExt: string;
  timeOfDay?: string | null;
  location?: { name: string } | null;
}

interface DraggableSceneItemProps {
  scene: SceneItem;
  isAssigned: boolean;
}

export function DraggableSceneItem({ scene, isAssigned }: DraggableSceneItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `scene-${scene.id}`,
    data: { type: 'scene', sceneId: scene.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all
        ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-sm'}
        ${isAssigned
          ? 'border-[var(--border-color)] opacity-60 bg-[var(--surface-panel)]'
          : 'border-[var(--border-color)] bg-[var(--surface-card)] hover:border-[var(--color-primary)]'
        }`}
    >
      <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-6 flex-shrink-0">
        {scene.sceneNumber}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate text-[var(--text-primary)]">
          {scene.intExt}. {scene.location?.name ?? '—'}
        </p>
        {scene.timeOfDay && (
          <p className="text-[10px] text-[var(--text-muted)]">{scene.timeOfDay}</p>
        )}
      </div>
      {isAssigned && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0" />}
      <GripVertical size={10} className="text-[var(--text-muted)] opacity-40 flex-shrink-0" />
    </div>
  );
}
