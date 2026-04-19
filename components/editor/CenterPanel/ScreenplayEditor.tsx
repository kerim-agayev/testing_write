'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
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
import { createCharacterSuggestion } from '@/lib/editor/extensions/CharacterSuggestion';
import { createSceneHeadingSuggestion } from '@/lib/editor/extensions/SceneHeadingSuggestion';
import { ElementToolbar } from './ElementToolbar';
import { SceneNavigationBar } from './SceneNavigationBar';
import { SceneHeadingBar } from './SceneHeadingBar';

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

  const { data: characters = [] } = useQuery<string[]>({
    queryKey: ['characters-names', screenplayId],
    queryFn: () =>
      fetch(`/api/screenplays/${screenplayId}/characters`)
        .then((r) => r.ok ? r.json() : [])
        .then((data: Array<{ name: string }>) => Array.isArray(data) ? data.map((c) => c.name) : []),
    staleTime: 30_000,
  });

  const { data: locations = [] } = useQuery<string[]>({
    queryKey: ['locations-names', screenplayId],
    queryFn: () =>
      fetch(`/api/screenplays/${screenplayId}/locations`)
        .then((r) => r.ok ? r.json() : [])
        .then((data: Array<{ name: string }>) => Array.isArray(data) ? data.map((l) => l.name) : []),
    staleTime: 30_000,
  });

  const charactersRef = useRef<string[]>(characters);
  const locationsRef = useRef<string[]>(locations);
  useEffect(() => { charactersRef.current = characters; }, [characters]);
  useEffect(() => { locationsRef.current = locations; }, [locations]);

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
      createCharacterSuggestion(() => charactersRef.current),
      createSceneHeadingSuggestion(() => locationsRef.current),
    ],
    content: initialContent ?? DEFAULT_CONTENT,
    onUpdate: ({ editor: ed }) => {
      setDirty(true);
      debouncedSave(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-full',
        spellcheck: 'true',
      },
    },
    immediatelyRender: false,
  });

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
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
    <div className="min-h-full" onKeyDown={handleKeyDown}>
      {/* Unified Sticky Header: SceneHeadingBar + SceneNavigationBar + ElementToolbar */}
      <div className="sticky top-0 z-20 bg-[var(--surface-base)] border-b border-[var(--border-color)] shadow-sm">
        <SceneHeadingBar screenplayId={screenplayId} />
        {scenes.length > 0 && onSceneNavigate && (
          <SceneNavigationBar scenes={scenes} currentSceneId={sceneId} onNavigate={onSceneNavigate} />
        )}
        <ElementToolbar editor={editor} />
      </div>

      {/* Editor content — scrollable area */}
      <div className="px-8 py-6">
        <div
          className="screenplay-page screenplay-editor mx-auto shadow-1"
          style={{
            width: '100%',
            maxWidth: '680px',
            minHeight: '11in',
            padding: '72px 72px 72px 108px',
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
