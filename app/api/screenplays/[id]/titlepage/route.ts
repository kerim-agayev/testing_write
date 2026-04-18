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

    const { synopsis, authorEmail, authorPhone, writtenDate } = await req.json();

    const updated = await prisma.screenplay.update({
      where: { id: params.id },
      data: {
        synopsis: synopsis !== undefined ? synopsis : undefined,
        authorEmail: authorEmail !== undefined ? authorEmail : undefined,
        authorPhone: authorPhone !== undefined ? authorPhone : undefined,
        writtenDate: writtenDate ? new Date(writtenDate) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update title page' }, { status: 500 });
  }
}
