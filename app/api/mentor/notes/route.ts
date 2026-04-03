import { NextResponse } from 'next/server';
import { requireAuth, requireRole, handleAuthError } from '@/lib/auth-utils';
import { createMentorNote } from '@/lib/db/mentors';
import { CreateMentorNoteSchema } from '@/lib/validations/mentor';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/mentor/notes?sceneId=xxx — get notes for a scene
export async function GET(req: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get('sceneId');

    if (!sceneId) {
      return NextResponse.json({ error: 'sceneId required' }, { status: 400 });
    }

    const notes = await prisma.mentorNote.findMany({
      where: { sceneId },
      include: { mentor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/mentor/notes — mentor adds note/flag to scene
export async function POST(req: Request) {
  try {
    const user = await requireRole(['MENTOR', 'ADMIN']);
    const body = await req.json();
    const parsed = CreateMentorNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const note = await createMentorNote({
      mentorId: user.id,
      ...parsed.data,
    });

    // Notify screenplay owner
    const scene = await prisma.scene.findUnique({
      where: { id: parsed.data.sceneId },
      select: {
        sceneNumber: true,
        sequence: { select: { structure: { select: { act: { select: { screenplayId: true, screenplay: { select: { ownerId: true, title: true } } } } } } } },
      },
    });
    if (scene) {
      const sp = scene.sequence.structure.act.screenplay;
      const noteType = parsed.data.type === 'FLAG' ? 'flagged' : 'commented on';
      await createNotification({
        userId: sp.ownerId,
        type: `mentor_${parsed.data.type.toLowerCase()}`,
        message: `Mentor ${user.name} ${noteType} Scene ${scene.sceneNumber} in "${sp.title}"`,
        linkUrl: `/screenplay/${scene.sequence.structure.act.screenplayId}/edit`,
      });
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
