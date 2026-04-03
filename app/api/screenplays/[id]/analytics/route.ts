import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { getStoryGridData, getStoryArcData } from '@/lib/utils/story-grid';
import { getArcsByScreenplay } from '@/lib/db/arcs';
import { prisma } from '@/lib/prisma';
import {
  calculateEpisodeAverages,
  buildSceneEpisodeMap,
} from '@/lib/utils/arc-calculations';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/analytics
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;

    // Fetch all analytics data in parallel
    const [storyGrid, storyArc, allArcs, screenplay] = await Promise.all([
      getStoryGridData(id),
      getStoryArcData(id),
      getArcsByScreenplay(id),
      prisma.screenplay.findUnique({
        where: { id },
        select: {
          type: true,
          episodes: { orderBy: { order: 'asc' } },
          characters: {
            where: { isMajor: true },
            select: { id: true, name: true, roleType: true },
          },
        },
      }),
    ]);

    if (!screenplay) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Group arcs by character
    const characterArcs = screenplay.characters.map((char) => {
      const arcs = allArcs
        .filter((a) => a.character.id === char.id)
        .map((a) => ({
          sceneId: a.scene.id,
          sceneNumber: a.scene.sceneNumber,
          externalScore: a.externalScore,
          internalScore: a.internalScore,
          synopsis: a.scene.synopsis,
        }));

      return { character: char, arcs };
    });

    // For TV series: compute episode averages
    let episodeAverages = null;
    if (screenplay.type === 'SERIES' && screenplay.episodes.length > 0) {
      const scenes = await prisma.scene.findMany({
        where: { sequence: { structure: { act: { screenplayId: id } } } },
        select: {
          id: true,
          sequence: {
            select: {
              structure: {
                select: { act: { select: { episodeId: true } } },
              },
            },
          },
        },
      });

      const sceneEpisodeMap = buildSceneEpisodeMap(scenes);

      episodeAverages = screenplay.characters.map((char) => {
        const charArcs = allArcs
          .filter((a) => a.character.id === char.id)
          .map((a) => ({
            sceneId: a.scene.id,
            externalScore: a.externalScore,
            internalScore: a.internalScore,
          }));

        return {
          character: char,
          averages: calculateEpisodeAverages(
            charArcs,
            sceneEpisodeMap,
            screenplay.episodes
          ),
        };
      });
    }

    return NextResponse.json({
      storyGrid,
      storyArc,
      characterArcs,
      episodeAverages,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
