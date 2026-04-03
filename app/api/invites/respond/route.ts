import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const RespondSchema = z.object({
  screenplayId: z.string().min(1),
  action: z.enum(['accept', 'reject']),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = RespondSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { screenplayId, action } = parsed.data;

    const collab = await prisma.screenplayCollaborator.findFirst({
      where: {
        screenplayId,
        userId: user.id,
        acceptedAt: null,
      },
      include: {
        screenplay: { select: { title: true, ownerId: true } },
      },
    });

    if (!collab) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (action === 'accept') {
      await prisma.screenplayCollaborator.update({
        where: {
          screenplayId_userId: {
            screenplayId,
            userId: user.id,
          },
        },
        data: { acceptedAt: new Date() },
      });

      await createNotification({
        userId: collab.screenplay.ownerId,
        type: 'collaboration_accepted',
        message: `${user.name} accepted your invite to "${collab.screenplay.title}"`,
        linkUrl: `/screenplay/${screenplayId}/share`,
      });
    } else {
      await prisma.screenplayCollaborator.delete({
        where: {
          screenplayId_userId: {
            screenplayId,
            userId: user.id,
          },
        },
      });

      await createNotification({
        userId: collab.screenplay.ownerId,
        type: 'collaboration_rejected',
        message: `${user.name} declined your invite to "${collab.screenplay.title}"`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
