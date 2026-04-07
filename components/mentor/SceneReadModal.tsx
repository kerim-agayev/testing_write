'use client';

import { X } from 'lucide-react';
import { tiptapToScreenplayText } from '@/lib/tiptap-to-text';

interface Scene {
  sceneNumber: number;
  intExt: string;
  location: { name: string } | null;
  timeOfDay: string | null;
  content: unknown;
}

interface Props {
  scene: Scene | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SceneReadModal({ scene, isOpen, onClose }: Props) {
  if (!isOpen || !scene) return null;

  const plainText = tiptapToScreenplayText(scene.content);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                  S.{scene.sceneNumber}
                </span>
                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">
                  Yalnız oxu
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5 font-mono">
                {scene.intExt}. {scene.location?.name ?? 'MEKAN'} — {scene.timeOfDay ?? 'GÜN'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--surface-panel)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!scene.content || plainText.trim() === '' ? (
              <p className="text-sm text-[var(--text-muted)] italic text-center py-8">
                Bu sahnə üçün məzmun yoxdur.
              </p>
            ) : (
              <pre
                className="font-mono text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed bg-white rounded-lg p-4 border border-[var(--border-color)]"
                style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
              >
                {plainText}
              </pre>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
