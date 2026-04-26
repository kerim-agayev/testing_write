import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { sceneId: string } }
) {
  const owner = await prisma.sceneOwner.findUnique({
    where: { sceneId: params.sceneId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });
  return Response.json(owner ?? null);
}

export async function PUT(
  req: Request,
  { params }: { params: { sceneId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId } = await req.json();

  const scene = await prisma.scene.findUnique({
    where: { id: params.sceneId },
    include: {
      sequence: {
        include: {
          structure: {
            include: {
              act: {
                include: {
                  screenplay: {
                    include: { collaborators: { select: { userId: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!scene) return Response.json({ error: 'Scene not found' }, { status: 404 });

  const screenplay = scene.sequence.structure.act.screenplay;
  const allUserIds = [screenplay.ownerId, ...screenplay.collaborators.map((c) => c.userId)];
  if (!allUserIds.includes(session.user.id)) {
    return Response.json({ error: 'Access denied' }, { status: 403 });
  }

  const owner = await prisma.sceneOwner.upsert({
    where: { sceneId: params.sceneId },
    update: { userId, updatedAt: new Date() },
    create: { sceneId: params.sceneId, userId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return Response.json(owner);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { sceneId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.sceneOwner.deleteMany({ where: { sceneId: params.sceneId } });
  return Response.json({ success: true });
}
