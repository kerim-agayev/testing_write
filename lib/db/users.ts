import { prisma } from '@/lib/prisma';

export async function listUsers(search?: string) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { screenplays: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAdminStats() {
  const [totalUsers, totalScreenplays, totalScenes, activeThisWeek] =
    await Promise.all([
      prisma.user.count(),
      prisma.screenplay.count(),
      prisma.scene.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

  return { totalUsers, totalScreenplays, totalScenes, activeThisWeek };
}
