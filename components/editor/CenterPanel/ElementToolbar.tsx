'use client';

import type { Editor } from '@tiptap/react';
import { useTranslations } from 'next-intl';

const ELEMENTS = [
  { type: 'sceneHeading', label: 'S.H.', shortcut: '⌘1' },
  { type: 'actionLine', label: 'Action', shortcut: '⌘2' },
  { type: 'characterName', label: 'Character', shortcut: '⌘3' },
  { type: 'dialogue', label: 'Dialogue', shortcut: '⌘4' },
  { type: 'parenthetical', label: '( )', shortcut: '⌘5' },
  { type: 'transition', label: 'Trans.', shortcut: '⌘6' },
];

export function ElementToolbar({ editor }: { editor: Editor }) {
  const t = useTranslations('editor.toolbar');
  const currentType = editor.state.selection.$from.parent.type.name;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 mb-4 border-b border-[var(--border-color)] bg-[var(--surface-panel)] rounded-t max-w-[680px] mx-auto">
      {ELEMENTS.map((el) => (
        <button
          key={el.type}
          title={`${el.label} (${el.shortcut})`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setNode(el.type).run(); }}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            currentType === el.type
              ? 'bg-[var(--color-primary)] text-white font-medium'
              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card)] hover:text-[var(--color-primary)]'
          }`}
        >
          {el.label}
        </button>
      ))}
      <div className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">
        Tab = {t('next') || 'next'}
      </div>
    </div>
  );
}
