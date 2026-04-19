import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const cards = await prisma.card.findMany({
      where: { screenplayId: params.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Cards GET error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch cards';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { title, description, color } = await req.json();

    const lastCard = await prisma.card.findFirst({
      where: { screenplayId: params.id },
      orderBy: { order: 'desc' },
    });

    const card = await prisma.card.create({
      data: {
        screenplayId: params.id,
        title: title || 'New Card',
        description: description || null,
        color: color || '#6B7280',
        order: (lastCard?.order ?? -1) + 1,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Cards POST error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create card';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
