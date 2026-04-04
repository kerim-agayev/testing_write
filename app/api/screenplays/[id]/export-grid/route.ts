import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') ?? 'csv';

    const scenes = await prisma.scene.findMany({
      where: { sequence: { structure: { act: { screenplayId: id } } } },
      select: {
        sceneNumber: true,
        storyEvent: true,
        valueShift: true,
        polarityShift: true,
        turnOn: true,
        turningPoint: true,
        sceneCharacters: { select: { character: { select: { name: true } } } },
      },
      orderBy: { sceneNumber: 'asc' },
    });

    const rows = scenes.map(s => ({
      'Scene #': s.sceneNumber,
      'Story Event': s.storyEvent ?? '',
      'Value Shift': s.valueShift ?? '',
      'Polarity': s.polarityShift ?? '',
      'Turn On': s.turnOn ?? '',
      'Turning Point': s.turningPoint ? 'Yes' : 'No',
      'Characters': s.sceneCharacters.map(sc => sc.character.name).join(', '),
    }));

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [
        { wch: 8 }, { wch: 40 }, { wch: 25 },
        { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 30 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Story Grid');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="story-grid.xlsx"',
        },
      });
    }

    // CSV
    if (rows.length === 0) {
      return new Response('No data', { headers: { 'Content-Type': 'text/plain' } });
    }
    const header = Object.keys(rows[0]).join(',');
    const csvRows = rows.map(r =>
      Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    return new Response([header, ...csvRows].join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="story-grid.csv"',
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
