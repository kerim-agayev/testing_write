import { NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { getAdminStats } from '@/lib/db/users';

// GET /api/admin/stats
export async function GET() {
  try {
    await requireRole('ADMIN');
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleAuthError(error);
  }
}
