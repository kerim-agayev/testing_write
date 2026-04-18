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

    const { items } = await req.json();

    await prisma.$transaction(
      (items || []).map(({ id, order }: { id: string; order: number }) =>
        prisma.card.update({
          where: { id },
          data: { order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to reorder cards' }, { status: 500 });
  }
}
