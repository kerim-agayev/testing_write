import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { UpdateLocaleSchema } from '@/lib/validations/user';

// PATCH /api/profile/locale
export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = UpdateLocaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { preferredLocale: parsed.data.locale },
    });

    const cookieStore = await cookies();
    cookieStore.set('scriptflow-locale', parsed.data.locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
