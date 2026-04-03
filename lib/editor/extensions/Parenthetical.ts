import { Node, mergeAttributes } from '@tiptap/core';

export const Parenthetical = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p[data-type="parenthetical"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'parenthetical',
        class: 'parenthetical',
      }),
      0,
    ];
  },
});
