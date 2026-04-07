import { prisma } from '@/lib/prisma';
import type { ScreenplayType } from '@prisma/client';

export async function listScreenplays(userId: string) {
  return prisma.screenplay.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId, acceptedAt: { not: null } } } },
      ],
    },
    select: {
      id: true,
      title: true,
      type: true,
      genre: true,
      logline: true,
      isDemo: true,
      lastEditedAt: true,
      createdAt: true,
      updatedAt: true,
      ownerId: true,
      owner: { select: { id: true, name: true } },
      _count: { select: { collaborators: true } },
      collaborators: { select: { userId: true }, where: { acceptedAt: { not: null } } },
    },
    orderBy: { lastEditedAt: 'desc' },
  });
}

export async function getScreenplay(id: string, userId: string) {
  const screenplay = await prisma.screenplay.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      episodes: { orderBy: { order: 'asc' } },
      acts: {
        orderBy: { order: 'asc' },
        include: {
          structures: {
            orderBy: { order: 'asc' },
            include: {
              sequences: {
                orderBy: { order: 'asc' },
                include: {
                  scenes: {
                    orderBy: { sceneNumber: 'asc' },
                    select: {
                      id: true,
                      sceneNumber: true,
                      intExt: true,
                      timeOfDay: true,
                      synopsis: true,
                      storyValueScore: true,
                      locationId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      characters: {
        select: { id: true, name: true, roleType: true, isMajor: true },
        orderBy: { createdAt: 'asc' },
      },
      locations: { orderBy: { name: 'asc' } },
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!screenplay) return null;

  // Check access
  const isOwner = screenplay.ownerId === userId;
  const isCollaborator = screenplay.collaborators.some(
    (c) => c.userId === userId && c.acceptedAt
  );
  const isMentor = await prisma.mentorAssignment.findFirst({
    where: { screenplayId: id, mentorId: userId, status: 'ACTIVE' },
  });

  if (!isOwner && !isCollaborator && !isMentor && !screenplay.isDemo) {
    return null;
  }

  return screenplay;
}

export async function getDemoScreenplay() {
  return prisma.screenplay.findFirst({
    where: { isDemo: true },
    include: {
      owner: { select: { id: true, name: true } },
      acts: {
        orderBy: { order: 'asc' },
        include: {
          structures: {
            orderBy: { order: 'asc' },
            include: {
              sequences: {
                orderBy: { order: 'asc' },
                include: {
                  scenes: {
                    orderBy: { sceneNumber: 'asc' },
                    select: {
                      id: true,
                      sceneNumber: true,
                      intExt: true,
                      timeOfDay: true,
                      synopsis: true,
                      content: true,
                      storyEvent: true,
                      valueShift: true,
                      polarityShift: true,
                      turnOn: true,
                      turningPoint: true,
                      storyValueScore: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      characters: {
        select: { id: true, name: true, roleType: true, isMajor: true },
      },
    },
  });
}

export async function createScreenplay(
  ownerId: string,
  data: {
    title: string;
    type: ScreenplayType;
    genre: string[];
    logline?: string | null;
  }
) {
  return prisma.screenplay.create({
    data: {
      ownerId,
      title: data.title,
      type: data.type,
      genre: data.genre,
      logline: data.logline,
    },
  });
}

export async function updateScreenplay(
  id: string,
  data: {
    title?: string;
    genre?: string[];
    logline?: string | null;
    isDemo?: boolean;
  }
) {
  // If setting as demo, unset all others first
  if (data.isDemo) {
    await prisma.screenplay.updateMany({
      where: { isDemo: true },
      data: { isDemo: false },
    });
  }

  return prisma.screenplay.update({
    where: { id },
    data: {
      ...data,
      lastEditedAt: new Date(),
    },
  });
}

export async function deleteScreenplay(id: string) {
  return prisma.screenplay.delete({ where: { id } });
}

export async function isScreenplayOwner(screenplayId: string, userId: string) {
  const sp = await prisma.screenplay.findUnique({
    where: { id: screenplayId },
    select: { ownerId: true },
  });
  return sp?.ownerId === userId;
}

export async function canEditScreenplay(screenplayId: string, userId: string) {
  const sp = await prisma.screenplay.findUnique({
    where: { id: screenplayId },
    select: {
      ownerId: true,
      collaborators: {
        where: { userId, acceptedAt: { not: null } },
        select: { role: true },
      },
    },
  });
  if (!sp) return false;
  if (sp.ownerId === userId) return true;
  return sp.collaborators.some((c) => c.role === 'CO_WRITER');
}
