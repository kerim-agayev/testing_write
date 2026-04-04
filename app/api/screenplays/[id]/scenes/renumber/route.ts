import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    const scenes = await prisma.scene.findMany({
      where: { sequence: { structure: { act: { screenplayId: id } } } },
      orderBy: { sceneNumber: 'asc' },
      select: { id: true },
    });

    await prisma.$transaction(
      scenes.map((s, i) => prisma.scene.update({
        where: { id: s.id },
        data: { sceneNumber: i + 1 },
      }))
    );

    return NextResponse.json({ success: true, total: scenes.length });
  } catch (error) {
    return handleAuthError(error);
  }
}
