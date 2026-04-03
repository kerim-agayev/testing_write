import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const InviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// GET /api/screenplays/:id/collaborators
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const screenplay = await prisma.screenplay.findFirst({
      where: {
        id,
        OR: [
          { ownerId: user.id },
          { collaborators: { some: { userId: user.id } } },
        ],
      },
    });
    if (!screenplay) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const collaborators = await prisma.screenplayCollaborator.findMany({
      where: { screenplayId: id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { invitedAt: 'desc' },
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/screenplays/:id/collaborators
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await req.json();

    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Valid email required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Self-invite check
    if (email === user.email) {
      return NextResponse.json(
        { error: 'You cannot invite yourself', code: 'SELF_INVITE' },
        { status: 400 }
      );
    }

    // Ownership check
    const screenplay = await prisma.screenplay.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!screenplay) {
      return NextResponse.json(
        { error: 'Only the owner can invite collaborators', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Find invited user
    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) {
      return NextResponse.json(
        { error: 'No user found with this email', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Duplicate check
    const existing = await prisma.screenplayCollaborator.findFirst({
      where: { screenplayId: id, userId: invitedUser.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'This user is already a collaborator', code: 'DUPLICATE' },
        { status: 409 }
      );
    }

    // Create collaborator
    const collaborator = await prisma.screenplayCollaborator.create({
      data: {
        screenplayId: id,
        userId: invitedUser.id,
        role: 'CO_WRITER',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: invitedUser.id,
        type: 'collaboration_invite',
        message: `${user.name} invited you as a co-writer on "${screenplay.title}"`,
        linkUrl: `/screenplay/${id}/edit`,
      },
    });

    return NextResponse.json({ success: true, collaborator });
  } catch (error) {
    return handleAuthError(error);
  }
}
