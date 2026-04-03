import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { UpdateThemeSchema } from '@/lib/validations/user';

// PATCH /api/profile/theme
export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = UpdateThemeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { preferredTheme: parsed.data.theme },
    });

    const cookieStore = await cookies();
    cookieStore.set('scriptflow-theme', parsed.data.theme, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
