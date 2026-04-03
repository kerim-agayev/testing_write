import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();

    const pending = await prisma.screenplayCollaborator.findMany({
      where: {
        userId: user.id,
        acceptedAt: null,
      },
      include: {
        screenplay: {
          select: {
            id: true,
            title: true,
            type: true,
            owner: { select: { name: true } },
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });

    return NextResponse.json(pending);
  } catch (error) {
    return handleAuthError(error);
  }
}
