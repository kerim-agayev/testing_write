import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { markAllRead } from '@/lib/notifications';

export async function PATCH() {
  try {
    const user = await requireAuth();
    await markAllRead(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
