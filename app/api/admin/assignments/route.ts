import { NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { assignMentor, updateAssignmentStatus } from '@/lib/db/mentors';
import { AssignMentorSchema } from '@/lib/validations/mentor';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/admin/assignments — list mentor assignments (optionally filter by status)
export async function GET(req: Request) {
  try {
    await requireRole('ADMIN');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const assignments = await prisma.mentorAssignment.findMany({
      where: status ? { status: status as 'PENDING' | 'ACTIVE' | 'COMPLETED' } : {},
      include: {
        mentor: { select: { id: true, name: true, email: true } },
        screenplay: {
          select: {
            id: true,
            title: true,
            type: true,
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    return handleAuthError(error);
  }
}

const UpdateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['ACTIVE', 'COMPLETED']),
});

// PATCH /api/admin/assignments — approve/reject/update mentor assignment
export async function PATCH(req: Request) {
  try {
    await requireRole('ADMIN');
    const body = await req.json();

    // Support both old format (screenplayId+mentorId) and new format (id+status)
    if (body.id && body.status) {
      const parsed = UpdateStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
      }

      const assignment = await updateAssignmentStatus(parsed.data.id, parsed.data.status);

      // Notify mentor when approved
      if (parsed.data.status === 'ACTIVE') {
        const fullAssignment = await prisma.mentorAssignment.findUnique({
          where: { id: parsed.data.id },
          include: { screenplay: { select: { title: true } } },
        });
        if (fullAssignment) {
          await prisma.notification.create({
            data: {
              userId: fullAssignment.mentorId,
              type: 'mentor_approved',
              message: `You have been approved to mentor "${fullAssignment.screenplay.title}"`,
              linkUrl: '/mentor',
            },
          });
        }
      }

      return NextResponse.json(assignment);
    }

    // Legacy format
    const parsed = AssignMentorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { screenplayId, mentorId, status } = parsed.data;
    const assignment = await assignMentor(screenplayId, mentorId, status || 'ACTIVE');
    return NextResponse.json(assignment);
  } catch (error) {
    return handleAuthError(error);
  }
}

// DELETE /api/admin/assignments — reject/delete assignment
export async function DELETE(req: Request) {
  try {
    await requireRole('ADMIN');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID required' }, { status: 400 });
    }

    const assignment = await prisma.mentorAssignment.findUnique({
      where: { id },
      include: {
        screenplay: { select: { title: true, ownerId: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.mentorAssignment.delete({ where: { id } });

    // Notify the screenplay owner
    await prisma.notification.create({
      data: {
        userId: assignment.screenplay.ownerId,
        type: 'mentor_rejected',
        message: `Your mentor request for "${assignment.screenplay.title}" was declined`,
        linkUrl: `/screenplay/${assignment.screenplayId}/share`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
