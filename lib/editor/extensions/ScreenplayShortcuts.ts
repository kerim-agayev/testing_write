import { Extension } from '@tiptap/core';

const CYCLE = ['sceneHeading', 'actionLine', 'characterName', 'dialogue', 'parenthetical', 'transition'];

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',

  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        const cur = this.editor.state.selection.$from.parent.type.name;
        const map: Record<string, string> = {
          'sceneHeading': 'actionLine',
          'characterName': 'dialogue',
          'dialogue': 'actionLine',
          'parenthetical': 'dialogue',
          'transition': 'sceneHeading',
        };
        const next = map[cur];
        if (!next) return false;
        return this.editor.chain().focus().insertContentAt(this.editor.state.selection.$from.after(), { type: next }).run();
      },

      'Tab': () => {
        const cur = this.editor.state.selection.$from.parent.type.name;

        // Action → Character (only on empty line)
        if (cur === 'actionLine') {
          const isEmpty = this.editor.state.selection.$from.parent.textContent.trim() === '';
          if (!isEmpty) return false;
          return this.editor.chain().focus().insertContentAt(this.editor.state.selection.$from.after(), { type: 'characterName' }).run();
        }

        // Default: cycle
        const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
        return this.editor.chain().focus().setNode(next).run();
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
