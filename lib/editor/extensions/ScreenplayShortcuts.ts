import { Extension } from '@tiptap/core';

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

        switch (cur) {
          case 'sceneHeading':
            this.editor.chain().focus().setNode('actionLine').run();
            return true;

          case 'actionLine': {
            const isEmpty = this.editor.state.selection.$from.parent.textContent.trim() === '';
            if (isEmpty) {
              this.editor.chain().focus().setNode('characterName').run();
            }
            return true;
          }

          case 'characterName':
            this.editor.chain().focus().setNode('parenthetical').run();
            return true;

          case 'dialogue':
            this.editor.chain().focus().setNode('parenthetical').run();
            return true;

          case 'parenthetical':
            this.editor.chain().focus().setNode('dialogue').run();
            return true;

          case 'transition':
            this.editor.chain().focus().setNode('sceneHeading').run();
            return true;

          default:
            return true;
        }
      },

      'Shift-Tab': () => {
        const cur = this.editor.state.selection.$from.parent.type.name;

        switch (cur) {
          case 'actionLine':
            this.editor.chain().focus().setNode('sceneHeading').run();
            return true;
          case 'characterName':
            this.editor.chain().focus().setNode('actionLine').run();
            return true;
          case 'dialogue':
            this.editor.chain().focus().setNode('characterName').run();
            return true;
          case 'parenthetical':
            this.editor.chain().focus().setNode('characterName').run();
            return true;
          case 'transition':
            this.editor.chain().focus().setNode('actionLine').run();
            return true;
          default:
            return true;
        }
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
