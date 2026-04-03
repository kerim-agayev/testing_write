import { NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { createMentorNote } from '@/lib/db/mentors';
import { CreateMentorNoteSchema } from '@/lib/validations/mentor';

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

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
