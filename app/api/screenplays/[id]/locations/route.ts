import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  try {
    const screenplay = await prisma.screenplay.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!screenplay || screenplay.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const locations = await prisma.location.findMany({
      where: { screenplayId: id },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Locations GET error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch locations';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, intExt, description } = await req.json();

    const screenplay = await prisma.screenplay.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });
    if (!screenplay || screenplay.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await prisma.location.findFirst({
      where: { screenplayId: params.id, name: name?.trim().toUpperCase() },
    });
    if (existing) {
      return NextResponse.json({ error: 'Location already exists' }, { status: 409 });
    }

    const location = await prisma.location.create({
      data: {
        screenplayId: params.id,
        name: (name || '').trim().toUpperCase() || 'LOCATION',
        intExt: intExt || 'INT',
        description: description || null,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Locations POST error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
