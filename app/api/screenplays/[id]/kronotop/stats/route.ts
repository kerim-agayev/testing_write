import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { KRONOTOPLAR } from '@/lib/kronotop/data';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;

    const allAssignments = await prisma.sceneKronotop.findMany({
      where: { scene: { sequence: { structure: { act: { screenplayId: id } } } } },
    });
    const totalScenes = await prisma.scene.count({
      where: { sequence: { structure: { act: { screenplayId: id } } } },
    });

    const countMap: Record<string, number> = {};
    allAssignments.forEach(a => {
      countMap[a.kronotopId] = (countMap[a.kronotopId] ?? 0) + 1;
    });

    const distribution = Object.entries(countMap)
      .map(([kronotopId, count]) => {
        const k = KRONOTOPLAR.find(k => k.id === kronotopId);
        return { kronotopId, name: k?.name, count, color: k?.color ?? '#333', icon: k?.icon };
      })
      .sort((a, b) => b.count - a.count);

    const scenesWithKronotop = new Set(allAssignments.map(a => a.sceneId)).size;

    return NextResponse.json({
      distribution,
      totalScenes,
      scenesWithKronotop,
      scenesWithoutKronotop: totalScenes - scenesWithKronotop,
      totalAssignments: allAssignments.length,
      avgKronotopPerScene: totalScenes > 0
        ? parseFloat((allAssignments.length / totalScenes).toFixed(1))
        : 0,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
