import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; locId: string } }
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
    const location = await prisma.location.update({
      where: { id: params.locId },
      data: {
        name: data.name ? data.name.trim().toUpperCase() : undefined,
        intExt: data.intExt,
        description: data.description !== undefined ? data.description : undefined,
      },
    });

    // Sync intExt to all scenes using this location
    if (data.intExt) {
      await prisma.scene.updateMany({
        where: { locationId: params.locId },
        data: { intExt: data.intExt },
      });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Location PATCH error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; locId: string } }
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

    await prisma.location.delete({ where: { id: params.locId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Location DELETE error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
