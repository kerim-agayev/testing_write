import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/arc-comparison?char1Id=&char2Id=&arcType=external|internal
export async function GET(req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const char1Id = searchParams.get('char1Id');
    const char2Id = searchParams.get('char2Id');
    const arcType = (searchParams.get('arcType') ?? 'external') as 'external' | 'internal';

    if (!char1Id || !char2Id) {
      return NextResponse.json({ error: 'char1Id and char2Id required' }, { status: 400 });
    }

    const scenes = await prisma.scene.findMany({
      where: { sequence: { structure: { act: { screenplayId: id } } } },
      orderBy: { sceneNumber: 'asc' },
      select: { id: true, sceneNumber: true },
    });

    const [arcs1, arcs2] = await Promise.all([
      prisma.characterArc.findMany({
        where: { characterId: char1Id, sceneId: { in: scenes.map((s) => s.id) } },
      }),
      prisma.characterArc.findMany({
        where: { characterId: char2Id, sceneId: { in: scenes.map((s) => s.id) } },
      }),
    ]);

    const arc1Map = Object.fromEntries(arcs1.map((a) => [a.sceneId, a]));
    const arc2Map = Object.fromEntries(arcs2.map((a) => [a.sceneId, a]));

    const data = scenes.map((scene) => ({
      sceneNumber: scene.sceneNumber,
      sceneId: scene.id,
      char1Score: arcType === 'external'
        ? (arc1Map[scene.id]?.externalScore ?? null)
        : (arc1Map[scene.id]?.internalScore ?? null),
      char2Score: arcType === 'external'
        ? (arc2Map[scene.id]?.externalScore ?? null)
        : (arc2Map[scene.id]?.internalScore ?? null),
    }));

    return NextResponse.json(data);
  } catch (error) {
    return handleAuthError(error);
  }
}
