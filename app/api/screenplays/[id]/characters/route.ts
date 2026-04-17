import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { listCharacters, createCharacter } from '@/lib/db/characters';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { CreateCharacterSchema } from '@/lib/validations/character';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/characters
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const characters = await listCharacters(id);
    return NextResponse.json(characters);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/screenplays/:id/characters
export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Cannot edit this screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CreateCharacterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const character = await createCharacter(id, parsed.data);
    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
