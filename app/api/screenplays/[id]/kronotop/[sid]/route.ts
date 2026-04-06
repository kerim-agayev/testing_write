import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string; sid: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { sid } = await params;
    await prisma.sceneKronotop.delete({ where: { id: sid } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
