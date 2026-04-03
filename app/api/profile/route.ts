import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { UpdateProfileSchema, ChangePasswordSchema } from '@/lib/validations/user';

// GET /api/profile — get current user profile
export async function GET() {
  try {
    const sessionUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        preferredLocale: true,
        preferredTheme: true,
        createdAt: true,
        _count: {
          select: {
            screenplays: true,
            collaborations: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleAuthError(error);
  }
}

// PATCH /api/profile — update profile
export async function PATCH(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();

    // Check if this is a password change
    if (body.currentPassword) {
      const parsed = ChangePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
      });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const valid = await bcrypt.compare(
        parsed.data.currentPassword,
        user.passwordHash
      );
      if (!valid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ ok: true, message: 'Password updated' });
    }

    // Regular profile update
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}
