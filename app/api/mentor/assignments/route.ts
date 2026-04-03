import { NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { getMentorAssignments } from '@/lib/db/mentors';

// GET /api/mentor/assignments — mentor's assigned screenplays
export async function GET() {
  try {
    const user = await requireRole(['MENTOR', 'ADMIN']);
    const assignments = await getMentorAssignments(user.id);
    return NextResponse.json(assignments);
  } catch (error) {
    return handleAuthError(error);
  }
}
