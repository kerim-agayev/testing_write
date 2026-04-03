import { NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { assignMentor } from '@/lib/db/mentors';
import { AssignMentorSchema } from '@/lib/validations/mentor';

// PATCH /api/admin/assignments — admin assigns/updates mentor assignment
export async function PATCH(req: Request) {
  try {
    await requireRole('ADMIN');
    const body = await req.json();
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
