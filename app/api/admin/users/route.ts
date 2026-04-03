import { NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { listUsers } from '@/lib/db/users';

// GET /api/admin/users
export async function GET(req: Request) {
  try {
    await requireRole('ADMIN');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;

    const users = await listUsers(search);
    return NextResponse.json(users);
  } catch (error) {
    return handleAuthError(error);
  }
}
