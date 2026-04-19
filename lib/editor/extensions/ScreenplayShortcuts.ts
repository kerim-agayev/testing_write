import { Extension } from '@tiptap/core';

export const ScreenplayShortcuts = Extension.create({
  name: 'screenplayShortcuts',

  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        const cur = this.editor.state.selection.$from.parent.type.name;

        // actionLine: let ProseMirror default split (creates new actionLine of same type)
        if (cur === 'actionLine') return false;

        const map: Record<string, string> = {
          sceneHeading: 'actionLine',
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

        switch (cur) {
          case 'sceneHeading':
            this.editor.chain().focus().setNode('actionLine').run();
            return true;

          case 'actionLine':
            this.editor.chain().focus().setNode('characterName').run();
            return true;

          case 'characterName': {
            this.editor.chain().focus().setNode('parenthetical').run();
            const pos = this.editor.state.selection.$from.start();
            const nodeText = this.editor.state.selection.$from.parent.textContent;
            if (!nodeText.startsWith('(')) {
              this.editor
                .chain()
                .focus()
                .setTextSelection(pos)
                .insertContent('()')
                .setTextSelection(pos + 1)
                .run();
            }
            return true;
          }

          case 'dialogue':
            this.editor.chain().focus().setNode('parenthetical').run();
            return true;

          case 'parenthetical':
            this.editor.chain().focus().setNode('dialogue').run();
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
