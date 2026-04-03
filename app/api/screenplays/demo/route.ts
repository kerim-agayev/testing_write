import { NextResponse } from 'next/server';
import { getDemoScreenplay } from '@/lib/db/screenplays';

// GET /api/screenplays/demo — public, no auth required
export async function GET() {
  try {
    const demo = await getDemoScreenplay();

    if (!demo) {
      return NextResponse.json(
        { error: 'No demo screenplay configured' },
        { status: 404 }
      );
    }

    return NextResponse.json(demo);
  } catch (error) {
    console.error('[GET /api/screenplays/demo]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
