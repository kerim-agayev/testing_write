import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { getArcsByScreenplay, upsertArc } from '@/lib/db/arcs';
import { UpsertArcSchema } from '@/lib/validations/mentor';
import { canEditScreenplay } from '@/lib/db/screenplays';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/arcs
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const arcs = await getArcsByScreenplay(id);
    return NextResponse.json(arcs);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/screenplays/:id/arcs — upsert arc score
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
    const parsed = UpsertArcSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const arc = await upsertArc(parsed.data);
    return NextResponse.json(arc);
  } catch (error) {
    return handleAuthError(error);
  }
}
