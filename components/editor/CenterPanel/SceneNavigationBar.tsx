'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SceneRef {
  id: string;
  sceneNumber: number;
  intExt: string;
  location?: { name: string } | null;
}

interface Props {
  scenes: SceneRef[];
  currentSceneId: string | null;
  onNavigate: (id: string) => void;
}

export function SceneNavigationBar({ scenes, currentSceneId, onNavigate }: Props) {
  const currentIndex = scenes.findIndex(s => s.id === currentSceneId);
  const prevScene = currentIndex > 0 ? scenes[currentIndex - 1] : null;
  const nextScene = currentIndex < scenes.length - 1 ? scenes[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--border-color)] bg-[var(--surface-panel)] text-xs text-[var(--text-muted)]">
      {prevScene ? (
        <button
          onClick={() => onNavigate(prevScene.id)}
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft size={13} />
          <span>S.{prevScene.sceneNumber} — {prevScene.intExt}. {prevScene.location?.name ?? '...'}</span>
        </button>
      ) : (
        <div />
      )}

      <span className="font-mono font-medium text-[var(--text-secondary)]">
        Scene {currentIndex + 1} / {scenes.length}
      </span>

      {nextScene ? (
        <button
          onClick={() => onNavigate(nextScene.id)}
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <span>S.{nextScene.sceneNumber} — {nextScene.intExt}. {nextScene.location?.name ?? '...'}</span>
          <ChevronRight size={13} />
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}
