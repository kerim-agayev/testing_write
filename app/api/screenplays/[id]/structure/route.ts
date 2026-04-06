import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/screenplays/:id/structure?type=THREE_ACT
// Upsert: returns existing or creates new ScreenplayStructure
export async function GET(req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type')?.toUpperCase();

    if (!type) {
      return NextResponse.json({ error: 'Missing type param' }, { status: 400 });
    }

    const validTypes = ['THREE_ACT', 'SAVE_THE_CAT', 'DAN_HARMON', 'VOGLER', 'JOHN_TRUBY', 'EIGHT_SEQUENCE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid structure type' }, { status: 400 });
    }

    const structure = await prisma.screenplayStructure.upsert({
      where: {
        screenplayId_structureType: {
          screenplayId: id,
          structureType: type as any,
        },
      },
      create: { screenplayId: id, structureType: type as any },
      update: {},
    });

    return NextResponse.json(structure);
  } catch (error) {
    return handleAuthError(error);
  }
}
