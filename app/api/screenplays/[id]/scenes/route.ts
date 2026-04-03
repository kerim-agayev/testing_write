import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { listScenes, createScene } from '@/lib/db/scenes';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { CreateSceneSchema } from '@/lib/validations/scene';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/scenes
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const scenes = await listScenes(id);
    return NextResponse.json(scenes);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/screenplays/:id/scenes
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
    const parsed = CreateSceneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const scene = await createScene(parsed.data);
    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
