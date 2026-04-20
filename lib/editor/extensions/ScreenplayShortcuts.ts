import { Extension } from '@tiptap/core';

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',

  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        const cur = this.editor.state.selection.$from.parent.type.name;

        const map: Record<string, string> = {
          sceneHeading: 'actionLine',
          actionLine: 'actionLine',
          characterName: 'dialogue',
          dialogue: 'actionLine',
          parenthetical: 'dialogue',
          transition: 'sceneHeading',
        };
        const next = map[cur];
        if (!next) return false;

        const endPos = this.editor.state.selection.$from.after();
        return this.editor
          .chain()
          .focus()
          .insertContentAt(endPos, { type: next, content: [] })
          .run();
      },

      'Tab': () => {
        const cur = this.editor.state.selection.$from.parent.type.name;

        // Full cycle: actionLine → characterName → dialogue → parenthetical → transition → actionLine
        const cycle: Record<string, string> = {
          sceneHeading: 'actionLine',
          actionLine: 'characterName',
          characterName: 'dialogue',
          dialogue: 'parenthetical',
          parenthetical: 'transition',
          transition: 'actionLine',
        };

        const next = cycle[cur];
        if (!next) return true;

        this.editor.chain().focus().setNode(next).run();
        return true;
      },

      'Mod-1': () => this.editor.chain().focus().setNode('sceneHeading').run(),
      'Mod-2': () => this.editor.chain().focus().setNode('actionLine').run(),
      'Mod-3': () => this.editor.chain().focus().setNode('characterName').run(),
      'Mod-4': () => this.editor.chain().focus().setNode('dialogue').run(),
      'Mod-5': () => this.editor.chain().focus().setNode('parenthetical').run(),
      'Mod-6': () => this.editor.chain().focus().setNode('transition').run(),
    };
  },
});
