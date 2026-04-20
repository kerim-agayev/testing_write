import { prisma } from '@/lib/prisma';
import type { IntExt, PolarityShift, TurnOn } from '@prisma/client';

export async function listScenes(screenplayId: string) {
  // Lightweight list — no content field (it's large)
  return prisma.scene.findMany({
    where: {
      sequence: {
        structure: {
          act: { screenplayId },
        },
      },
    },
    select: {
      id: true,
      sequenceId: true,
      sceneNumber: true,
      intExt: true,
      timeOfDay: true,
      synopsis: true,
      storyValueScore: true,
      locationId: true,
      location: { select: { name: true } },
      content: true,
      turningPoint: true,
      sceneCharacters: {
        select: {
          character: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { sceneNumber: 'asc' },
  });
}

export async function getScene(sceneId: string) {
  return prisma.scene.findUnique({
    where: { id: sceneId },
    include: {
      location: true,
      sceneCharacters: {
        include: { character: { select: { id: true, name: true, roleType: true } } },
      },
      characterArcs: true,
      mentorNotes: {
        include: { mentor: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createScene(data: {
  sequenceId: string;
  sceneNumber?: number;
  intExt?: IntExt;
  locationId?: string | null;
  timeOfDay?: string | null;
  content?: unknown;
}) {
  // Auto-assign scene number if not provided
  let sceneNumber = data.sceneNumber;
  if (!sceneNumber) {
    const lastScene = await prisma.scene.findFirst({
      where: {
        sequence: {
          structure: {
            act: {
              screenplay: {
                acts: {
                  some: {
                    structures: {
                      some: {
                        sequences: {
                          some: { id: data.sequenceId },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { sceneNumber: 'desc' },
      select: { sceneNumber: true },
    });
    sceneNumber = (lastScene?.sceneNumber ?? 0) + 1;
  }

  return prisma.scene.create({
    data: {
      sequenceId: data.sequenceId,
      sceneNumber,
      intExt: data.intExt ?? 'INT',
      locationId: data.locationId,
      timeOfDay: data.timeOfDay,
      content: data.content ?? { type: 'doc', content: [] },
    },
  });
}

export async function updateScene(
  sceneId: string,
  data: {
    content?: unknown;
    intExt?: IntExt;
    locationId?: string | null;
    timeOfDay?: string | null;
    synopsis?: string | null;
    storyEvent?: string | null;
    valueShift?: string | null;
    polarityShift?: PolarityShift | null;
    turnOn?: TurnOn | null;
    turningPoint?: boolean;
    storyValueScore?: number | null;
    emotionStart?: string | null;
    emotionEnd?: string | null;
    characterArcs?: Array<{
      characterId: string;
      externalScore: number;
      internalScore: number;
    }>;
    characterIds?: string[];
  }
) {
  const { characterArcs, characterIds, content, ...sceneData } = data;

  // Use transaction for atomic scene + arc updates
  return prisma.$transaction(async (tx) => {
    const updatedScene = await tx.scene.update({
      where: { id: sceneId },
      data: {
        ...sceneData,
        ...(content !== undefined ? { content: content as object } : {}),
      },
    });

    // Upsert character arcs
    if (characterArcs && characterArcs.length > 0) {
      for (const arc of characterArcs) {
        await tx.characterArc.upsert({
          where: {
            characterId_sceneId: {
              characterId: arc.characterId,
              sceneId,
            },
          },
          update: {
            externalScore: arc.externalScore,
            internalScore: arc.internalScore,
          },
          create: {
            characterId: arc.characterId,
            sceneId,
            externalScore: arc.externalScore,
            internalScore: arc.internalScore,
          },
        });
      }
    }

    // Update scene characters
    if (characterIds !== undefined) {
      await tx.sceneCharacter.deleteMany({ where: { sceneId } });
      if (characterIds.length > 0) {
        await tx.sceneCharacter.createMany({
          data: characterIds.map((cid) => ({ sceneId, characterId: cid })),
        });
      }
    }

    // Touch screenplay lastEditedAt
    const sequence = await tx.sequence.findUnique({
      where: { id: updatedScene.sequenceId },
      select: { structure: { select: { act: { select: { screenplayId: true } } } } },
    });
    if (sequence) {
      await tx.screenplay.update({
        where: { id: sequence.structure.act.screenplayId },
        data: { lastEditedAt: new Date() },
      });
    }

    return updatedScene;
  });
}

export async function deleteScene(sceneId: string) {
  return prisma.scene.delete({ where: { id: sceneId } });
}
