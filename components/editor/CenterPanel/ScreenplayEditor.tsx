'use client';

import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDebouncedCallback } from 'use-debounce';
import { useEditorStore } from '@/store/editorStore';
import { useSaveScene } from '@/lib/api/hooks';
import {
  SceneHeading,
  ActionLine,
  CharacterName,
  Dialogue,
  Parenthetical,
  Transition,
  ScreenplayShortcuts,
} from '@/lib/editor/extensions';
import { ElementToolbar } from './ElementToolbar';
import { SceneNavigationBar } from './SceneNavigationBar';

interface SceneRef {
  id: string;
  sceneNumber: number;
  intExt: string;
  location?: { name: string } | null;
}

interface ScreenplayEditorProps {
  sceneId: string;
  screenplayId: string;
  initialContent: Record<string, unknown> | null;
  scenes?: SceneRef[];
  onSceneNavigate?: (id: string) => void;
}

const DEFAULT_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'sceneHeading',
      content: [{ type: 'text', text: 'INT. LOCATION - DAY' }],
    },
    {
      type: 'actionLine',
      content: [{ type: 'text', text: '' }],
    },
  ],
};

export function ScreenplayEditor({ sceneId, screenplayId, initialContent, scenes = [], onSceneNavigate }: ScreenplayEditorProps) {
  const { setDirty, setSaving, setLastSavedAt } = useEditorStore();
  const saveScene = useSaveScene(screenplayId);

  const debouncedSave = useDebouncedCallback((content: Record<string, unknown>) => {
    setSaving(true);
    saveScene.mutate(
      { sceneId, data: { content } },
      {
        onSuccess: () => {
          setSaving(false);
          setDirty(false);
          setLastSavedAt(new Date());
        },
        onError: () => {
          setSaving(false);
        },
      }
    );
  }, 1500);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      SceneHeading,
      ActionLine,
      CharacterName,
      Dialogue,
      Parenthetical,
      Transition,
      ScreenplayShortcuts,
    ],
    content: initialContent ?? DEFAULT_CONTENT,
    onUpdate: ({ editor: ed }) => {
      setDirty(true);
      debouncedSave(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'screenplay-editor outline-none min-h-full',
        spellcheck: 'true',
      },
    },
    immediatelyRender: false,
  });

  // Update content when scene changes
  useEffect(() => {
    if (editor && initialContent) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(initialContent);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(initialContent);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  // Ctrl/Cmd+S force save (Tab/shortcuts handled by ScreenplayShortcuts extension)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && editor) {
      e.preventDefault();
      debouncedSave.flush();
      setSaving(true);
      saveScene.mutate(
        { sceneId, data: { content: editor.getJSON() } },
        {
          onSuccess: () => { setSaving(false); setDirty(false); setLastSavedAt(new Date()); },
          onError: () => setSaving(false),
        }
      );
    }
  }, [editor, debouncedSave, saveScene, sceneId, setSaving, setDirty, setLastSavedAt]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {scenes.length > 0 && onSceneNavigate && (
        <SceneNavigationBar scenes={scenes} currentSceneId={sceneId} onNavigate={onSceneNavigate} />
      )}
      <ElementToolbar editor={editor} />
      <div
        className="screenplay-page mx-auto shadow-1"
        style={{
          width: '100%',
          maxWidth: '680px',
          minHeight: '11in',
          padding: '72px 72px 72px 108px',
        }}
        onKeyDown={handleKeyDown}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
