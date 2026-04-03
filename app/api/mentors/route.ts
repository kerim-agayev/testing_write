import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET /api/mentors — list active mentors (for users to browse and request)
export async function GET() {
  try {
    await requireAuth();

    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { mentorAssignments: { where: { status: 'ACTIVE' } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(mentors);
  } catch (error) {
    return handleAuthError(error);
  }
}
