import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import tippy, { Instance } from 'tippy.js';
import { SuggestionPopup, SuggestionItem } from '@/components/editor/ui/SuggestionPopup';

const CharacterSuggestionPluginKey = new PluginKey('characterSuggestion');

export function createCharacterSuggestion(getCharacters: () => string[]) {
  return Extension.create({
    name: 'characterSuggestion',

    addProseMirrorPlugins() {
      return [
        Suggestion({
          pluginKey: CharacterSuggestionPluginKey,
          editor: this.editor,
          char: '',
          startOfLine: true,

          allow: ({ state }) => {
            const nodeType = state.selection.$from.parent.type.name;
            return nodeType === 'characterName';
          },

          items: ({ query }): SuggestionItem[] => {
            const chars = getCharacters();
            if (!chars || chars.length === 0) return [];
            const q = query.toUpperCase().trim();
            if (!q) return chars.slice(0, 8).map((c) => ({ id: c, label: c.toUpperCase() }));
            return chars
              .filter((c) => c.toUpperCase().startsWith(q))
              .slice(0, 8)
              .map((c) => ({ id: c, label: c.toUpperCase() }));
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
                // Let Tab pass through to ScreenplayShortcuts for node type switching
                if (props.event.key === 'Tab') {
                  popup?.[0]?.hide();
                  component?.destroy();
                  return false;
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
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent(item.id.toUpperCase())
              .run();
          },
        }),
      ];
    },
  });
}
