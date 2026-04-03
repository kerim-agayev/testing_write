import { Node, mergeAttributes } from '@tiptap/core';

export const SceneHeading = Node.create({
  name: 'sceneHeading',
  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p[data-type="scene-heading"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'scene-heading',
        class: 'scene-heading',
      }),
      0,
    ];
  },
});
