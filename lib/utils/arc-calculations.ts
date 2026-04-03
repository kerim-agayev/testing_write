import type { CharacterArc, Episode } from '@prisma/client';

export type EpisodeAverage = {
  episodeId: string;
  episodeOrder: number;
  episodeTitle: string;
  external: number | null;
  internal: number | null;
  sceneCount: number;
};

/**
 * Maps scene IDs to their episode (via scene → sequence → structure → act → episode chain).
 * Pre-computed to avoid N+1 queries.
 */
export type SceneEpisodeEntry = {
  sceneId: string;
  episodeId: string | null;
};

/**
 * Calculate episode-averaged arc scores for a character across a season.
 * Each episode's score = average of all CharacterArc scores in that episode's scenes.
 */
export function calculateEpisodeAverages(
  arcs: Pick<CharacterArc, 'sceneId' | 'externalScore' | 'internalScore'>[],
  sceneEpisodeMap: SceneEpisodeEntry[],
  episodes: Pick<Episode, 'id' | 'order' | 'title'>[]
): EpisodeAverage[] {
  return episodes.map((episode) => {
    // Get scene IDs for this episode
    const episodeSceneIds = sceneEpisodeMap
      .filter((s) => s.episodeId === episode.id)
      .map((s) => s.sceneId);

    // Get arcs for those scenes
    const episodeArcs = arcs.filter((a) => episodeSceneIds.includes(a.sceneId));

    if (episodeArcs.length === 0) {
      return {
        episodeId: episode.id,
        episodeOrder: episode.order,
        episodeTitle: episode.title,
        external: null,
        internal: null,
        sceneCount: 0,
      };
    }

    const avgExternal = Math.round(
      episodeArcs.reduce((sum, a) => sum + a.externalScore, 0) / episodeArcs.length
    );
    const avgInternal = Math.round(
      episodeArcs.reduce((sum, a) => sum + a.internalScore, 0) / episodeArcs.length
    );

    return {
      episodeId: episode.id,
      episodeOrder: episode.order,
      episodeTitle: episode.title,
      external: avgExternal,
      internal: avgInternal,
      sceneCount: episodeArcs.length,
    };
  });
}

/**
 * Build a map of scene IDs to episode IDs.
 * Uses the chain: scene → sequence → structure → act → episode.
 */
export function buildSceneEpisodeMap(
  scenes: Array<{
    id: string;
    sequence: {
      structure: {
        act: {
          episodeId: string | null;
        };
      };
    };
  }>
): SceneEpisodeEntry[] {
  return scenes.map((scene) => ({
    sceneId: scene.id,
    episodeId: scene.sequence.structure.act.episodeId,
  }));
}
