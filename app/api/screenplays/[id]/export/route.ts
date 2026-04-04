import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { generateDOCX, generatePDFHTML } from '@/lib/utils/export';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/export?format=docx|pdf
export async function GET(req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'docx';

    // Get screenplay title for filename
    const screenplay = await prisma.screenplay.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!screenplay) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const safeTitle = screenplay.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim();

    if (format === 'docx') {
      const buffer = await generateDOCX(id);
      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeTitle}.docx"`,
        },
      });
    }

    if (format === 'pdf') {
      const html = await generatePDFHTML(id);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid format. Use docx or pdf.' },
      { status: 400 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}
