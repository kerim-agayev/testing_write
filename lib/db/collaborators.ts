import { prisma } from '@/lib/prisma';

export async function inviteCollaborator(screenplayId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  return prisma.screenplayCollaborator.create({
    data: {
      screenplayId,
      userId: user.id,
      role: 'CO_WRITER',
    },
  });
}

export async function acceptCollaboration(screenplayId: string, userId: string) {
  return prisma.screenplayCollaborator.update({
    where: { screenplayId_userId: { screenplayId, userId } },
    data: { acceptedAt: new Date() },
  });
}

export async function removeCollaborator(screenplayId: string, userId: string) {
  return prisma.screenplayCollaborator.delete({
    where: { screenplayId_userId: { screenplayId, userId } },
  });
}

export async function getPendingInvitations(userId: string) {
  return prisma.screenplayCollaborator.findMany({
    where: { userId, acceptedAt: null },
    include: {
      screenplay: {
        select: { id: true, title: true, type: true, owner: { select: { name: true } } },
      },
    },
  });
}
