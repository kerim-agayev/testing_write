interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}

export function tiptapToScreenplayText(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const doc = json as { content?: TiptapNode[] };
  if (!doc.content) return '';

  const lines: string[] = [];

  function processNode(node: TiptapNode): string {
    if (node.type === 'text') return node.text ?? '';
    if (!node.content) return '';
    return node.content.map(processNode).join('');
  }

  for (const block of doc.content) {
    const text = processNode(block).trim();
    if (!text) continue;

    switch (block.type) {
      case 'sceneHeading':
      case 'scene_heading':
        lines.push(`\n${text.toUpperCase()}`);
        break;
      case 'action':
        lines.push(text);
        break;
      case 'character':
      case 'characterName':
        lines.push(`\n          ${text.toUpperCase()}`);
        break;
      case 'dialogue':
        lines.push(`     ${text}`);
        break;
      case 'parenthetical':
        lines.push(`          (${text})`);
        break;
      case 'transition':
        lines.push(`\n                              ${text.toUpperCase()}`);
        break;
      default:
        if (text) lines.push(text);
    }
  }

  return lines.join('\n');
}
