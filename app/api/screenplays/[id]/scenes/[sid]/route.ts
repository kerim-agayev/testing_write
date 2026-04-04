import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { getScene, updateScene, deleteScene } from '@/lib/db/scenes';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { UpdateSceneSchema } from '@/lib/validations/scene';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string; sid: string }> };

// GET /api/screenplays/:id/scenes/:sid
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { sid } = await params;
    const scene = await getScene(sid);

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    return NextResponse.json(scene);
  } catch (error) {
    return handleAuthError(error);
  }
}

// PATCH /api/screenplays/:id/scenes/:sid — autosave endpoint
export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id, sid } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Cannot edit this screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = UpdateSceneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Handle locationName -> upsert Location
    const updateData = { ...parsed.data };
    if (updateData.locationName) {
      const loc = await prisma.location.upsert({
        where: { screenplayId_name: { screenplayId: id, name: updateData.locationName.toUpperCase() } },
        create: { screenplayId: id, name: updateData.locationName.toUpperCase(), intExt: updateData.intExt ?? 'INT' },
        update: {},
      });
      updateData.locationId = loc.id;
      delete updateData.locationName;
    }

    const updated = await updateScene(sid, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}

// DELETE /api/screenplays/:id/scenes/:sid
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id, sid } = await params;

    const canEdit = await canEditScreenplay(id, user.id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Cannot edit this screenplay', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await deleteScene(sid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
