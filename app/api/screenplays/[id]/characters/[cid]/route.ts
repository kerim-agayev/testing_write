import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { getCharacter, updateCharacter, deleteCharacter } from '@/lib/db/characters';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { UpdateCharacterSchema } from '@/lib/validations/character';

type Params = { params: Promise<{ id: string; cid: string }> };

// GET /api/screenplays/:id/characters/:cid
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { cid } = await params;
    const character = await getCharacter(cid);

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json(character);
  } catch (error) {
    return handleAuthError(error);
  }
}

// PATCH /api/screenplays/:id/characters/:cid
export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id, cid } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Cannot edit this screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = UpdateCharacterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateCharacter(cid, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}

// DELETE /api/screenplays/:id/characters/:cid
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id, cid } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Cannot edit this screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await deleteCharacter(cid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
