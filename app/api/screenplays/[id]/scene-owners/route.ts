import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const owners = await prisma.sceneOwner.findMany({
    where: { scene: { sequence: { structure: { act: { screenplayId: params.id } } } } },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const map: Record<string, { userId: string; name: string; avatarUrl: string | null; updatedAt: string }> = {};
  for (const o of owners) {
    map[o.sceneId] = {
      userId: o.userId,
      name: o.user.name,
      avatarUrl: o.user.avatarUrl,
      updatedAt: o.updatedAt.toISOString(),
    };
  }

  return Response.json(map);
}
