import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const RequestSchema = z.object({
  mentorId: z.string().min(1),
});

// GET /api/screenplays/:id/mentor-request — get current mentor request status
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const { id } = params;

    const assignment = await prisma.mentorAssignment.findFirst({
      where: { screenplayId: id },
      include: {
        mentor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/screenplays/:id/mentor-request — request a mentor
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await req.json();

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Mentor ID required' }, { status: 400 });
    }

    // Verify screenplay ownership
    const screenplay = await prisma.screenplay.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!screenplay) {
      return NextResponse.json({ error: 'Not found or not owner' }, { status: 403 });
    }

    // Check for existing pending/active request
    const existing = await prisma.mentorAssignment.findFirst({
      where: { screenplayId: id, status: { in: ['PENDING', 'ACTIVE'] } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A mentor request already exists for this screenplay' },
        { status: 409 }
      );
    }

    // Create assignment
    const assignment = await prisma.mentorAssignment.create({
      data: {
        screenplayId: id,
        mentorId: parsed.data.mentorId,
        status: 'PENDING',
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'mentor_request',
        message: `${user.name} requested a mentor for "${screenplay.title}"`,
        linkUrl: '/admin',
      })),
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return handleAuthError(error);
  }
}

// DELETE /api/screenplays/:id/mentor-request — cancel pending request
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const assignment = await prisma.mentorAssignment.findFirst({
      where: {
        screenplayId: id,
        status: 'PENDING',
        screenplay: { ownerId: user.id },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'No pending request found' }, { status: 404 });
    }

    await prisma.mentorAssignment.delete({ where: { id: assignment.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
