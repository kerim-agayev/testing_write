import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; locId: string } }
) {
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

    const data = await req.json();
    const location = await prisma.location.update({
      where: { id: params.locId },
      data: {
        name: data.name ? data.name.trim().toUpperCase() : undefined,
        intExt: data.intExt,
        description: data.description !== undefined ? data.description : undefined,
      },
    });

    return NextResponse.json(location);
  } catch {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; locId: string } }
) {
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

    await prisma.location.delete({ where: { id: params.locId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
