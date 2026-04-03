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

export async function generatePDFBuffer(screenplayId: string): Promise<Buffer> {
  // PDF generation requires @react-pdf/renderer which needs React.
  // For server-side, we return a simple text representation.
  // Full PDF generation will be implemented in the frontend layer.
  const scenes = await prisma.scene.findMany({
    where: {
      sequence: { structure: { act: { screenplayId } } },
    },
    select: { sceneNumber: true, content: true },
    orderBy: { sceneNumber: 'asc' },
  });

  // Generate simple text for now — proper PDF rendering happens client-side
  const text = scenes
    .map((scene) => {
      const content = scene.content as ProseMirrorNode;
      return getTextContent(content);
    })
    .join('\n\n');

  return Buffer.from(text, 'utf-8');
}
