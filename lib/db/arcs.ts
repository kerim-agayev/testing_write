import { prisma } from '@/lib/prisma';

export async function getArcsByScreenplay(screenplayId: string) {
  return prisma.characterArc.findMany({
    where: {
      character: { screenplayId },
    },
    include: {
      character: { select: { id: true, name: true, roleType: true, isMajor: true } },
      scene: { select: { id: true, sceneNumber: true, synopsis: true } },
    },
    orderBy: { scene: { sceneNumber: 'asc' } },
  });
}

export async function getArcsByCharacter(characterId: string) {
  return prisma.characterArc.findMany({
    where: { characterId },
    include: {
      scene: { select: { id: true, sceneNumber: true, synopsis: true } },
    },
    orderBy: { scene: { sceneNumber: 'asc' } },
  });
}

export async function upsertArc(data: {
  characterId: string;
  sceneId: string;
  externalScore: number;
  internalScore: number;
}) {
  return prisma.characterArc.upsert({
    where: {
      characterId_sceneId: {
        characterId: data.characterId,
        sceneId: data.sceneId,
      },
    },
    update: {
      externalScore: data.externalScore,
      internalScore: data.internalScore,
    },
    create: data,
  });
}
