import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string; aid: string }> };

// DELETE /api/structure/:id/assignments/:aid
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { aid } = await params;

    await prisma.structureAssignment.delete({ where: { id: aid } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
