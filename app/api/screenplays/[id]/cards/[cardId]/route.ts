import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; cardId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const screenplay = await prisma.screenplay.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });
    if (!screenplay || screenplay.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const card = await prisma.card.update({
      where: { id: params.cardId },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        color: data.color !== undefined ? data.color : undefined,
        order: data.order !== undefined ? data.order : undefined,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Card PATCH error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update card';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; cardId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const screenplay = await prisma.screenplay.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });
    if (!screenplay || screenplay.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.card.delete({ where: { id: params.cardId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Card DELETE error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete card';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
