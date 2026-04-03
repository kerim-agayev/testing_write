import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import {
  getScreenplay,
  updateScreenplay,
  deleteScreenplay,
  isScreenplayOwner,
} from '@/lib/db/screenplays';
import { UpdateScreenplaySchema } from '@/lib/validations/screenplay';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const screenplay = await getScreenplay(id, user.id);

    if (!screenplay) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(screenplay);
  } catch (error) {
    return handleAuthError(error);
  }
}

// PATCH /api/screenplays/:id
export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateScreenplaySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Only admin can set isDemo
    if (parsed.data.isDemo !== undefined && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can set demo screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const isOwner = await isScreenplayOwner(id, user.id);
    if (!isOwner && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only the owner can update this screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const updated = await updateScreenplay(id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}

// DELETE /api/screenplays/:id
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const isOwner = await isScreenplayOwner(id, user.id);
    if (!isOwner && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only the owner can delete this screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await deleteScreenplay(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
