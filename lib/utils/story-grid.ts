import { prisma } from '@/lib/prisma';

export type StoryGridRow = {
  sceneId: string;
  sceneNumber: number;
  storyEvent: string | null;
  valueShift: string | null;
  polarityShift: string | null;
  turnOn: string | null;
  turningPoint: boolean;
  storyValueScore: number | null;
  onStageCharacters: Array<{ id: string; name: string }>;
};

export async function getStoryGridData(screenplayId: string): Promise<StoryGridRow[]> {
  const scenes = await prisma.scene.findMany({
    where: {
      sequence: {
        structure: {
          act: { screenplayId },
        },
      },
    },
    select: {
      id: true,
      sceneNumber: true,
      storyEvent: true,
      valueShift: true,
      polarityShift: true,
      turnOn: true,
      turningPoint: true,
      storyValueScore: true,
      sceneCharacters: {
        select: {
          character: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { sceneNumber: 'asc' },
  });

  return scenes.map((scene) => ({
    sceneId: scene.id,
    sceneNumber: scene.sceneNumber,
    storyEvent: scene.storyEvent,
    valueShift: scene.valueShift,
    polarityShift: scene.polarityShift,
    turnOn: scene.turnOn,
    turningPoint: scene.turningPoint,
    storyValueScore: scene.storyValueScore,
    onStageCharacters: scene.sceneCharacters.map((sc) => sc.character),
  }));
}

export type StoryArcPoint = {
  sceneId: string;
  sceneNumber: number;
  score: number | null;
  storyEvent: string | null;
  turningPoint: boolean;
  location: string | null;
};

export async function getStoryArcData(screenplayId: string): Promise<StoryArcPoint[]> {
  const scenes = await prisma.scene.findMany({
    where: {
      sequence: {
        structure: {
          act: { screenplayId },
        },
      },
    },
    select: {
      id: true,
      sceneNumber: true,
      storyValueScore: true,
      storyEvent: true,
      turningPoint: true,
      location: { select: { name: true } },
    },
    orderBy: { sceneNumber: 'asc' },
  });

  return scenes.map((s) => ({
    sceneId: s.id,
    sceneNumber: s.sceneNumber,
    score: s.storyValueScore,
    storyEvent: s.storyEvent,
    turningPoint: s.turningPoint,
    location: s.location?.name ?? null,
  }));
}
