import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { getUserNotifications, getUnreadCount } from '@/lib/notifications';

export async function GET() {
  try {
    const user = await requireAuth();
    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(user.id),
      getUnreadCount(user.id),
    ]);
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return handleAuthError(error);
  }
}
