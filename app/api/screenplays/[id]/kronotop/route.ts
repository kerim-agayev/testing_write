import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { prisma } from '@/lib/prisma';
import { KRONOTOPLAR } from '@/lib/kronotop/data';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get('sceneId');

    const where = sceneId
      ? { sceneId }
      : { scene: { sequence: { structure: { act: { screenplayId: id } } } } };

    const assignments = await prisma.sceneKronotop.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const { sceneId, kronotopId, note } = await req.json();

    // Validate kronotop ID
    const valid = KRONOTOPLAR.find(k => k.id === kronotopId);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid kronotop' }, { status: 400 });
    }

    // Check if already assigned
    const existing = await prisma.sceneKronotop.findFirst({ where: { sceneId, kronotopId } });
    if (existing) {
      return NextResponse.json({ error: 'Already assigned' }, { status: 409 });
    }

    const assignment = await prisma.sceneKronotop.create({
      data: { sceneId, kronotopId, note: note ?? null },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
