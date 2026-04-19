import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  PageNumber,
  Header,
  PageBreak,
} from 'docx';
import { prisma } from '@/lib/prisma';

type ProseMirrorNode = {
  type: string;
  content?: ProseMirrorNode[];
  text?: string;
  attrs?: Record<string, unknown>;
};

interface TitlePageData {
  title: string;
  authorName: string;
  genre: string;
  logline: string;
  authorEmail: string;
  authorPhone: string;
  writtenDate: string;
}

function getTextContent(node: ProseMirrorNode): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(getTextContent).join('');
  return '';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTitlePageParagraphs(data: TitlePageData): Paragraph[] {
  const monoFont = 'Courier Prime';
  const blank = () => new Paragraph({ children: [new TextRun({ text: '', font: monoFont, size: 24 })] });

  const paragraphs: Paragraph[] = [];

  // Top spacing (~1/3 of page)
  for (let i = 0; i < 12; i++) paragraphs.push(blank());

  // Title
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
      children: [
        new TextRun({
          text: (data.title || 'SCREENPLAY').toUpperCase(),
          bold: true,
          size: 28,
          font: monoFont,
        }),
      ],
    })
  );

  // Author Name
  if (data.authorName) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
        children: [new TextRun({ text: data.authorName, size: 24, font: monoFont })],
      })
    );
  }

  // Genre
  if (data.genre) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
        children: [new TextRun({ text: data.genre.toUpperCase(), size: 24, font: monoFont })],
      })
    );
  }

  // Logline
  if (data.logline) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [new TextRun({ text: data.logline, italics: true, size: 22, font: monoFont })],
      })
    );
  }

  // Middle spacing
  for (let i = 0; i < 8; i++) paragraphs.push(blank());

  // Email
  if (data.authorEmail) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: data.authorEmail, size: 22, font: monoFont })],
      })
    );
  }

  // Phone
  if (data.authorPhone) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [new TextRun({ text: data.authorPhone, size: 22, font: monoFont })],
      })
    );
  }

  // Bottom spacing
  for (let i = 0; i < 4; i++) paragraphs.push(blank());

  // Date — right aligned
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({ text: data.writtenDate, size: 22, font: monoFont, color: '666666' }),
      ],
    })
  );

  // Page break → scenes start on next page
  paragraphs.push(new Paragraph({ children: [new PageBreak()] }));

  return paragraphs;
}

function buildTitlePageHTML(data: TitlePageData): string {
  return `
    <div style="
      page-break-after: always;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12pt;
      min-height: 9in;
      display: flex;
      flex-direction: column;
      padding: 72pt 80pt;
    ">
      <div style="flex: 1.5;"></div>
      <div style="text-align: center; margin-bottom: 36pt;">
        <p style="font-size: 16pt; font-weight: bold; text-transform: uppercase;
                  letter-spacing: 0.05em; margin: 0;">
          ${escapeHtml((data.title || 'SCREENPLAY').toString())}
        </p>
      </div>
      ${data.authorName ? `
      <div style="text-align: center; margin-bottom: 24pt;">
        <p style="margin: 0;">${escapeHtml(data.authorName)}</p>
      </div>` : ''}
      ${data.genre ? `
      <div style="text-align: center; margin-bottom: 24pt;">
        <p style="text-transform: uppercase; margin: 0;">${escapeHtml(data.genre)}</p>
      </div>` : ''}
      ${data.logline ? `
      <div style="text-align: center; margin-bottom: 24pt;">
        <p style="font-style: italic; color: #444; margin: 0;">${escapeHtml(data.logline)}</p>
      </div>` : ''}
      <div style="flex: 1;"></div>
      <div style="text-align: center; margin-bottom: 24pt;">
        ${data.authorEmail ? `<p style="margin: 0 0 4pt 0;">${escapeHtml(data.authorEmail)}</p>` : ''}
        ${data.authorPhone ? `<p style="margin: 0;">${escapeHtml(data.authorPhone)}</p>` : ''}
      </div>
      <div style="flex: 0.5;"></div>
      <div style="text-align: right;">
        <p style="color: #666; margin: 0;">${escapeHtml(data.writtenDate)}</p>
      </div>
    </div>
  `;
}

async function loadTitlePageData(screenplayId: string): Promise<TitlePageData> {
  const screenplay = await prisma.screenplay.findUnique({
    where: { id: screenplayId },
    include: {
      owner: { select: { name: true } },
    },
  });

  const genreArr = (screenplay as { genre?: string[] | null } | null)?.genre;
  const genreStr = Array.isArray(genreArr) ? genreArr.filter(Boolean).join(', ') : '';

  const date = (screenplay as { writtenDate?: Date | null } | null)?.writtenDate;
  const writtenDate = date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return {
    title: screenplay?.title ?? 'Screenplay',
    authorName: screenplay?.owner?.name ?? '',
    genre: genreStr,
    logline: (screenplay as { logline?: string | null } | null)?.logline ?? '',
    authorEmail: (screenplay as { authorEmail?: string | null } | null)?.authorEmail ?? '',
    authorPhone: (screenplay as { authorPhone?: string | null } | null)?.authorPhone ?? '',
    writtenDate,
  };
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
              size: 24,
              bold: true,
            }),
          ],
          spacing: { before: 480, after: 240 },
        });

      case 'action':
      case 'actionLine':
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
          indent: { left: 3240 },
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
          indent: { left: 2520, right: 2520 },
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
          indent: { left: 3060 },
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
  const titleData = await loadTitlePageData(screenplayId);
  const titlePageParagraphs = buildTitlePageParagraphs(titleData);

  const scenes = await prisma.scene.findMany({
    where: {
      sequence: { structure: { act: { screenplayId } } },
    },
    select: { sceneNumber: true, content: true },
    orderBy: { sceneNumber: 'asc' },
  });

  const sceneParagraphs = scenes.flatMap((scene) =>
    buildSceneParagraphs(scene.content as ProseMirrorNode)
  );

  const allParagraphs = [
    ...titlePageParagraphs,
    ...(sceneParagraphs.length > 0 ? sceneParagraphs : [new Paragraph({ children: [new TextRun('')] })]),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 2160,
              right: 1440,
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
        children: allParagraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export async function generatePDFHTML(screenplayId: string): Promise<string> {
  const titleData = await loadTitlePageData(screenplayId);
  const titlePageHTML = buildTitlePageHTML(titleData);

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
    return content.content.map((node) => {
      const t = escapeHtml(getTextContent(node));
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
<html><head><meta charset="utf-8"><title>${escapeHtml(titleData.title)}</title>
<style>
@media print { @page { size: letter; margin: 1in 1in 1in 1.5in; } }
body{font-family:'Courier New',Courier,monospace;font-size:12pt;line-height:1.2;margin:0;color:#000;}
.sh{text-transform:uppercase;font-weight:bold;margin-top:2em;margin-bottom:.5em;}
.act{margin:.5em 0;}
.char{text-align:center;text-transform:uppercase;margin-top:1em;margin-bottom:0;padding-left:1.5in;}
.dial{margin-left:1in;margin-right:1.5in;margin-bottom:.5em;}
.paren{margin-left:1.3in;font-style:italic;}
.trans{text-align:right;text-transform:uppercase;margin-top:1em;}
.content-wrap{margin:1in 1in 1in 1.5in;}
</style></head>
<body>
${titlePageHTML}
<div class="content-wrap">
${scenesHTML}
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}
