import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { listScenes, createScene } from '@/lib/db/scenes';
import { canEditScreenplay } from '@/lib/db/screenplays';
import { CreateSceneSchema } from '@/lib/validations/scene';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/scenes
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

    const body = await req.json().catch(() => ({}));
    const parsed = CreateSceneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Auto-resolve sequenceId if not provided
    let sequenceId = parsed.data.sequenceId;
    if (!sequenceId) {
      // Find the last sequence in this screenplay
      const lastSequence = await prisma.sequence.findFirst({
        where: {
          structure: {
            act: { screenplayId: id },
          },
        },
        orderBy: { order: 'desc' },
      });

      if (lastSequence) {
        sequenceId = lastSequence.id;
      } else {
        // No structure exists — create default Act → Structure → Sequence
        const act = await prisma.act.create({
          data: { screenplayId: id, title: 'Act One', order: 1 },
        });
        const structure = await prisma.structure.create({
          data: { actId: act.id, title: 'Setup', order: 1 },
        });
        const sequence = await prisma.sequence.create({
          data: { structureId: structure.id, title: 'Sequence 1', order: 1 },
        });
        sequenceId = sequence.id;
      }
    }

    // Handle locationName → create/find Location
    let locationId = parsed.data.locationId ?? undefined;
    if (!locationId && parsed.data.locationName) {
      const loc = await prisma.location.upsert({
        where: { screenplayId_name: { screenplayId: id, name: parsed.data.locationName.toUpperCase() } },
        create: { screenplayId: id, name: parsed.data.locationName.toUpperCase(), intExt: parsed.data.intExt ?? 'INT' },
        update: {},
      });
      locationId = loc.id;
    }

    const intExtLabel =
      parsed.data.intExt === 'EXT' ? 'EXT.' :
      parsed.data.intExt === 'INT_EXT' ? 'INT./EXT.' :
      'INT.';
    const locationLabel = (parsed.data.locationName || 'LOCATION').toUpperCase();
    const timeLabel = parsed.data.timeOfDay || 'DAY';
    const headingText = `${intExtLabel} ${locationLabel} - ${timeLabel}`;
    const initialContent = {
      type: 'doc',
      content: [
        { type: 'sceneHeading', content: [{ type: 'text', text: headingText }] },
        { type: 'actionLine', content: [] },
      ],
    };

    const scene = await createScene({
      sequenceId,
      intExt: parsed.data.intExt,
      locationId: locationId ?? null,
      timeOfDay: parsed.data.timeOfDay,
      content: initialContent,
    });

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
