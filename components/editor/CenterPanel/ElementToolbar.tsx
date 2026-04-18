'use client';

import type { Editor } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { Undo2, Redo2 } from 'lucide-react';

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
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
        className={`p-1.5 rounded transition-colors ${
          editor.can().undo()
            ? 'text-[var(--text-secondary)] hover:bg-[var(--surface-card)] hover:text-[var(--color-primary)]'
            : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
        }`}
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
        className={`p-1.5 rounded transition-colors ${
          editor.can().redo()
            ? 'text-[var(--text-secondary)] hover:bg-[var(--surface-card)] hover:text-[var(--color-primary)]'
            : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
        }`}
      >
        <Redo2 size={14} />
      </button>

      <div className="w-px h-5 bg-[var(--border-color)] mx-1" />

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
