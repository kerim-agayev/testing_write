import { NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// GET /api/admin/screenwriters — Admin only
export async function GET() {
  try {
    await requireRole('ADMIN');

    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        screenplays: {
          select: { id: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const now = new Date();

    const result = users.map((u) => {
      const lastActivity = u.screenplays.length > 0 ? u.screenplays[0].updatedAt : u.updatedAt;
      const diffMs = now.getTime() - lastActivity.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      let activityLabel: string;
      let activityStatus: 'active' | 'idle' | 'lost';

      if (diffHours < 24) {
        activityLabel = `${diffHours} saat əvvəl`;
        activityStatus = 'active';
      } else if (diffDays < 7) {
        activityLabel = `${diffDays} gün əvvəl`;
        activityStatus = 'active';
      } else if (diffDays < 30) {
        activityLabel = `${diffDays} gün əvvəl`;
        activityStatus = 'idle';
      } else {
        activityLabel = `${diffDays} gün əvvəl`;
        activityStatus = 'lost';
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        screenplayCount: u.screenplays.length,
        screenplayTitles: u.screenplays.map((s) => s.title),
        lastActivity,
        activityLabel,
        activityStatus,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}
