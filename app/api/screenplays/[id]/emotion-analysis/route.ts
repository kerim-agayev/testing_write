import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/emotion-analysis
export async function GET(_req: Request, { params }: Params) {
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

    const scenes = await prisma.scene.findMany({
      where: { sequence: { structure: { act: { screenplayId: id } } } },
      select: { sceneNumber: true, emotionStart: true, emotionEnd: true },
      orderBy: { sceneNumber: 'asc' },
    });

    const scenesWithEmotions = scenes.filter((s) => s.emotionStart && s.emotionEnd);

    // Transition pair frequencies
    const transitionCounts: Record<string, number> = {};
    scenesWithEmotions.forEach((s) => {
      const key = `${s.emotionStart}→${s.emotionEnd}`;
      transitionCounts[key] = (transitionCounts[key] ?? 0) + 1;
    });

    // Start distribution
    const startDistribution: Record<string, number> = {};
    scenesWithEmotions.forEach((s) => {
      startDistribution[s.emotionStart!] = (startDistribution[s.emotionStart!] ?? 0) + 1;
    });

    // End distribution
    const endDistribution: Record<string, number> = {};
    scenesWithEmotions.forEach((s) => {
      endDistribution[s.emotionEnd!] = (endDistribution[s.emotionEnd!] ?? 0) + 1;
    });

    // Diversity score
    const uniqueTransitions = Object.keys(transitionCounts).length;
    const maxPossible = Math.min(scenesWithEmotions.length, 14 * 13);
    const diversityScore = maxPossible > 0 ? Math.round((uniqueTransitions / maxPossible) * 100) : 0;

    // Repeated transitions (3+ occurrences)
    const repeatedTransitions = Object.entries(transitionCounts)
      .filter(([, count]) => count >= 3)
      .sort(([, a], [, b]) => b - a);

    return NextResponse.json({
      totalScenes: scenes.length,
      scenesWithEmotions: scenesWithEmotions.length,
      transitionCounts,
      startDistribution,
      endDistribution,
      diversityScore,
      repeatedTransitions,
      timelineData: scenesWithEmotions,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
