import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/structure/:id/assignments
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;

    const assignments = await prisma.structureAssignment.findMany({
      where: { screenplayStructureId: id },
      include: {
        scene: {
          select: {
            id: true,
            sceneNumber: true,
            intExt: true,
            timeOfDay: true,
            location: { select: { name: true } },
          },
        },
      },
      orderBy: [{ structureStageId: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json(assignments);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/structure/:id/assignments
export async function POST(req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const { sceneId, structureStageId, note } = await req.json();

    if (!sceneId || !structureStageId) {
      return NextResponse.json({ error: 'Missing sceneId or structureStageId' }, { status: 400 });
    }

    // Check if same scene is already in this exact stage
    const existingSameStage = await prisma.structureAssignment.findFirst({
      where: { screenplayStructureId: id, sceneId, structureStageId },
    });
    if (existingSameStage) {
      return NextResponse.json({ error: 'Already assigned' }, { status: 409 });
    }

    // If scene is assigned to a DIFFERENT stage, delete the old one (move it)
    await prisma.structureAssignment.deleteMany({
      where: { screenplayStructureId: id, sceneId },
    });

    const assignment = await prisma.structureAssignment.create({
      data: {
        screenplayStructureId: id,
        sceneId,
        structureStageId,
        note: note ?? null,
      },
      include: {
        scene: {
          select: {
            id: true,
            sceneNumber: true,
            intExt: true,
            timeOfDay: true,
            location: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
