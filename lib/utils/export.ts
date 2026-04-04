import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  PageNumber,
  Header,
} from 'docx';
import { prisma } from '@/lib/prisma';

type ProseMirrorNode = {
  type: string;
  content?: ProseMirrorNode[];
  text?: string;
  attrs?: Record<string, unknown>;
};

function getTextContent(node: ProseMirrorNode): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(getTextContent).join('');
  return '';
}

function buildSceneParagraphs(content: ProseMirrorNode): Paragraph[] {
  if (!content.content) return [];

  return content.content.map((node) => {
    const text = getTextContent(node);

    switch (node.type) {
      case 'sceneHeading':
        return new Paragraph({
          children: [
            new TextRun({
              text: text.toUpperCase(),
              font: 'Courier Prime',
              size: 24, // 12pt
              bold: true,
            }),
          ],
          spacing: { before: 480, after: 240 },
        });

      case 'action':
        return new Paragraph({
          children: [
            new TextRun({
              text,
              font: 'Courier Prime',
              size: 24,
            }),
          ],
          spacing: { before: 240, after: 0 },
        });

      case 'characterName':
        return new Paragraph({
          children: [
            new TextRun({
              text: text.toUpperCase(),
              font: 'Courier Prime',
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          indent: { left: 3240 }, // ~2.25" from left
          spacing: { before: 240, after: 0 },
        });

      case 'dialogue':
        return new Paragraph({
          children: [
            new TextRun({
              text,
              font: 'Courier Prime',
              size: 24,
            }),
          ],
          indent: { left: 2520, right: 2520 }, // ~1.75" from each side
          spacing: { before: 0, after: 0 },
        });

      case 'parenthetical':
        return new Paragraph({
          children: [
            new TextRun({
              text: `(${text.replace(/^\(|\)$/g, '')})`,
              font: 'Courier Prime',
              size: 24,
            }),
          ],
          indent: { left: 3060 }, // ~2.1" from left
          spacing: { before: 0, after: 0 },
        });

      case 'transition':
        return new Paragraph({
          children: [
            new TextRun({
              text: text.toUpperCase(),
              font: 'Courier Prime',
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 240 },
        });

      default:
        return new Paragraph({
          children: [
            new TextRun({
              text,
              font: 'Courier Prime',
              size: 24,
            }),
          ],
        });
    }
  });
}

export async function generateDOCX(screenplayId: string): Promise<Buffer> {
  const scenes = await prisma.scene.findMany({
    where: {
      sequence: { structure: { act: { screenplayId } } },
    },
    select: { sceneNumber: true, content: true },
    orderBy: { sceneNumber: 'asc' },
  });

  const allParagraphs = scenes.flatMap((scene) =>
    buildSceneParagraphs(scene.content as ProseMirrorNode)
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1"
              bottom: 1440,
              left: 2160, // 1.5"
              right: 1440, // 1"
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Courier Prime',
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        },
        children:
          allParagraphs.length > 0
            ? allParagraphs
            : [new Paragraph({ children: [new TextRun('')] })],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export async function generatePDFHTML(screenplayId: string): Promise<string> {
  const screenplay = await prisma.screenplay.findUnique({
    where: { id: screenplayId },
    select: { title: true },
  });

  const scenes = await prisma.scene.findMany({
    where: {
      sequence: { structure: { act: { screenplayId } } },
    },
    select: { sceneNumber: true, content: true },
    orderBy: { sceneNumber: 'asc' },
  });

  const scenesHTML = scenes.map((scene) => {
    const content = scene.content as ProseMirrorNode;
    if (!content.content) return '';
    return content.content.map(node => {
      const t = getTextContent(node)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      switch (node.type) {
        case 'sceneHeading': return `<p class="sh">${t}</p>`;
        case 'actionLine':
        case 'action': return `<p class="act">${t}</p>`;
        case 'characterName': return `<p class="char">${t}</p>`;
        case 'dialogue': return `<p class="dial">${t}</p>`;
        case 'parenthetical': return `<p class="paren">(${t.replace(/^\(|\)$/g, '')})</p>`;
        case 'transition': return `<p class="trans">${t}</p>`;
        default: return `<p>${t}</p>`;
      }
    }).join('\n');
  }).join('\n');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${screenplay?.title ?? 'Screenplay'}</title>
<style>
@media print { @page { size: letter; margin: 1in 1in 1in 1.5in; } }
body{font-family:'Courier New',Courier,monospace;font-size:12pt;line-height:1.2;margin:1in 1in 1in 1.5in;color:#000;}
h1{text-align:center;font-size:14pt;margin-bottom:2em;}
.sh{text-transform:uppercase;font-weight:bold;margin-top:2em;margin-bottom:.5em;}
.act{margin:.5em 0;}
.char{text-align:center;text-transform:uppercase;margin-top:1em;margin-bottom:0;padding-left:1.5in;}
.dial{margin-left:1in;margin-right:1.5in;margin-bottom:.5em;}
.paren{margin-left:1.3in;font-style:italic;}
.trans{text-align:right;text-transform:uppercase;margin-top:1em;}
</style></head>
<body>
<h1>${screenplay?.title ?? ''}</h1>
${scenesHTML}
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}
