import { Node, mergeAttributes } from '@tiptap/core';

export const ActionLine = Node.create({
  name: 'actionLine',
  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p[data-type="action"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'action',
        class: 'action-line',
      }),
      0,
    ];
  },
});
