import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cards = await prisma.card.findMany({
      where: { screenplayId: params.id },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(cards);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
  } catch {
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}
