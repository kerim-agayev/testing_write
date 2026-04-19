import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const screenplay = await prisma.screenplay.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });
    if (!screenplay || screenplay.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { synopsis, authorEmail, authorPhone, writtenDate, genre, logline, title } = body;

    const data: Record<string, unknown> = {};
    if (synopsis !== undefined) data.synopsis = synopsis;
    if (authorEmail !== undefined) data.authorEmail = authorEmail;
    if (authorPhone !== undefined) data.authorPhone = authorPhone;
    if (writtenDate !== undefined) data.writtenDate = writtenDate ? new Date(writtenDate) : null;
    if (genre !== undefined) data.genre = Array.isArray(genre) ? genre : (genre ? [genre] : []);
    if (logline !== undefined) data.logline = logline;
    if (title !== undefined && typeof title === 'string' && title.trim()) data.title = title.trim();

    const updated = await prisma.screenplay.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Title page update error:', error);
    return NextResponse.json({ error: 'Failed to update title page' }, { status: 500 });
  }
}
