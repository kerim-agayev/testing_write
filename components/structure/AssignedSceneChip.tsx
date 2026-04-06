'use client';

import { X } from 'lucide-react';

interface AssignedSceneChipProps {
  assignment: {
    id: string;
    scene?: {
      sceneNumber: number;
      intExt: string;
      location?: { name: string } | null;
    } | null;
  };
  stageColor: string;
  onRemove: () => void;
}

export function AssignedSceneChip({ assignment, stageColor, onRemove }: AssignedSceneChipProps) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs group"
      style={{ background: `${stageColor}20`, color: stageColor }}
    >
      <span className="font-mono font-bold text-[10px] flex-shrink-0">
        {assignment.scene?.sceneNumber}
      </span>
      <span className="truncate flex-1 text-[10px]">
        {assignment.scene?.location?.name ?? '—'}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0 w-3 h-3 flex items-center justify-center"
      >
        <X size={8} />
      </button>
    </div>
  );
}
