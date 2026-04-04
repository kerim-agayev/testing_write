import { Extension } from '@tiptap/core';

const CYCLE = ['sceneHeading', 'actionLine', 'characterName', 'dialogue', 'parenthetical', 'transition'];

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',

  addKeyboardShortcuts() {
    return {
      'Tab': () => {
        const cur = this.editor.state.selection.$from.parent.type.name;
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
