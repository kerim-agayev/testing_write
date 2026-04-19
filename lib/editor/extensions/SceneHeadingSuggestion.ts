import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy, { Instance } from 'tippy.js';
import { SuggestionPopup, SuggestionItem } from '@/components/editor/ui/SuggestionPopup';

const INT_EXT_OPTIONS: SuggestionItem[] = [
  { id: 'INT.', label: 'INT.' },
  { id: 'EXT.', label: 'EXT.' },
  { id: 'INT./EXT.', label: 'INT./EXT.' },
];

const TIME_KEYWORDS = [
  'DAY',
  'NIGHT',
  'DAWN',
  'DUSK',
  'MORNING',
  'AFTERNOON',
  'EVENING',
  'CONTINUOUS',
  'LATER',
  'MOMENTS LATER',
];

const TIME_OPTIONS: SuggestionItem[] = TIME_KEYWORDS.map((t) => ({ id: t, label: t }));

export function createSceneHeadingSuggestion(getLocations: () => string[]) {
  return Extension.create({
    name: 'sceneHeadingSuggestion',

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: '',
          startOfLine: false,

          allow: ({ state }) => {
            const nodeType = state.selection.$from.parent.type.name;
            return nodeType === 'sceneHeading';
          },

          items: ({ query, editor }): SuggestionItem[] => {
            const nodeText = editor.state.selection.$from.parent.textContent.toUpperCase();
            const q = query.toUpperCase().trim();

            const hasIntExt =
              nodeText.startsWith('INT.') ||
              nodeText.startsWith('EXT.') ||
              nodeText.startsWith('INT./EXT.');

            if (!hasIntExt) {
              if (!q) return INT_EXT_OPTIONS;
              return INT_EXT_OPTIONS.filter((o) => o.id.startsWith(q));
            }

            const hasDash =
              nodeText.includes(' - ') ||
              nodeText.includes(' — ') ||
              nodeText.includes(' – ');

            if (!hasDash) {
              const locations = getLocations();
              if (!locations || locations.length === 0) return [];
              if (!q) {
                return locations.slice(0, 8).map((l) => ({ id: l, label: l.toUpperCase() }));
              }
              return locations
                .filter((l) => l.toUpperCase().includes(q))
                .slice(0, 8)
                .map((l) => ({ id: l, label: l.toUpperCase() }));
            }

            // After dash — suggest time keywords
            if (!q) return TIME_OPTIONS;
            return TIME_OPTIONS.filter((t) => t.id.startsWith(q));
          },

          render: () => {
            let component: ReactRenderer | null = null;
            let popup: Instance[] | null = null;

            return {
              onStart: (props) => {
                if (!props.clientRect) return;
                component = new ReactRenderer(SuggestionPopup, {
                  props,
                  editor: props.editor,
                });
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },
              onUpdate: (props) => {
                component?.updateProps(props);
                if (!props.clientRect) return;
                popup?.[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              },
              onKeyDown: (props) => {
                if (props.event.key === 'Escape') {
                  popup?.[0]?.hide();
                  return true;
                }
                const ref = component?.ref as
                  | { onKeyDown: (p: { event: KeyboardEvent }) => boolean }
                  | undefined;
                return ref?.onKeyDown({ event: props.event }) ?? false;
              },
              onExit: () => {
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },

          command: ({ editor, range, props }) => {
            const item = props as SuggestionItem;
            const id = item.id;

            const isIntExt = id === 'INT.' || id === 'EXT.' || id === 'INT./EXT.';
            const isTime = TIME_KEYWORDS.includes(id);

            let suffix = '';
            if (isIntExt) suffix = ' ';
            else if (!isTime) suffix = ' - ';

            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent(id.toUpperCase() + suffix)
              .run();
          },
        }),
      ];
    },
  });
}
