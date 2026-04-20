import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const TAG_TO_NODE: Record<string, string> = {
  action: 'actionLine',
  scene_description: 'actionLine',
  character: 'characterName',
  dialog: 'dialogue',
  dialogue: 'dialogue',
  parenthetical: 'parenthetical',
  transition: 'transition',
};

interface SceneElement {
  type: string;
  text: string;
}

interface ParsedScene {
  heading: string | null;
  elements: SceneElement[];
}

async function loadSqlJs() {
  // WASM is committed to public/_wasm/ — Next.js always includes public/ in serverless output
  const candidatePaths = [
    path.join(process.cwd(), 'public', '_wasm', 'sql-wasm.wasm'),
    path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    path.join('/var/task', 'public', '_wasm', 'sql-wasm.wasm'),
  ];

  let wasmBinary: Buffer | null = null;
  const errors: string[] = [];
  for (const p of candidatePaths) {
    try {
      wasmBinary = await fs.promises.readFile(p);
      break;
    } catch (e) {
      errors.push(`${p}: ${(e as Error).message}`);
    }
  }
  if (!wasmBinary) {
    throw new Error(
      `sql-wasm.wasm not found. Tried:\n${errors.join('\n')}\ncwd=${process.cwd()}`
    );
  }
  // sql.js is CJS — use require (serverExternalPackages ensures it's available on Vercel)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlMod = require('sql.js');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initSqlJs = typeof sqlMod === 'function' ? sqlMod : (sqlMod as any).default;
  const SQL = await initSqlJs({ wasmBinary });
  return SQL;
}

function parseKitspXML(xml: string): ParsedScene[] {
  const scenes: ParsedScene[] = [];
  let currentScene: ParsedScene | null = null;

  const blockRegex = /<(scene_heading|action|character|dialog|dialogue|parenthetical|transition|scene_description)(?:[^>]*)>[\s\S]*?<v><!\[CDATA\[([\s\S]*?)\]\]><\/v>[\s\S]*?<\/\1>/g;

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(xml)) !== null) {
    const tagType = match[1];
    const content = match[2].trim();
    if (!content) continue;

    if (tagType === 'scene_heading') {
      if (currentScene) scenes.push(currentScene);
      currentScene = { heading: content, elements: [] };
    } else if (currentScene) {
      const nodeType = TAG_TO_NODE[tagType];
      if (nodeType) {
        currentScene.elements.push({ type: nodeType, text: content });
      }
    }
  }

  if (currentScene) scenes.push(currentScene);
  return scenes;
}

function parseSceneHeading(heading: string): {
  intExt: 'INT' | 'EXT' | 'INT_EXT';
  locationName: string;
  timeOfDay: string;
} {
  const upper = heading.trim().toUpperCase();

  let intExt: 'INT' | 'EXT' | 'INT_EXT' = 'INT';
  if (upper.includes('INT./EXT') || upper.includes('INT/EXT')) intExt = 'INT_EXT';
  else if (upper.startsWith('EXT.') || upper.startsWith('EXT ')) intExt = 'EXT';

  const timeKeywords = [
    'MORNING',
    'DAY',
    'AFTERNOON',
    'EVENING',
    'NIGHT',
    'DAWN',
    'DUSK',
    'CONTINUOUS',
    'LATER',
    'MOMENTS LATER',
    'THE NEXT DAY',
  ];
  let timeOfDay = 'DAY';
  for (const t of timeKeywords) {
    if (upper.includes(t)) {
      timeOfDay = t;
      break;
    }
  }

  const locationName = upper
    .replace(/^(INT\.\/EXT\.|INT\.|EXT\.)\s*/i, '')
    .replace(new RegExp(`\\b(${timeKeywords.join('|')})\\b`, 'gi'), '')
    .replace(/[.\-–—]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  return { intExt, locationName: locationName || 'LOCATION', timeOfDay };
}

function buildTiptapJSON(heading: string | null, elements: SceneElement[]): object {
  const nodes: object[] = [];
  if (heading) {
    nodes.push({ type: 'sceneHeading', content: [{ type: 'text', text: heading.trim().toUpperCase() }] });
  }
  const elementNodes = elements
    .filter((e) => e.text && e.text.trim())
    .map((e) => ({
      type: e.type,
      content: [{ type: 'text', text: e.type === 'parenthetical' ? e.text.replace(/^\(|\)$/g, '').trim() : e.text }],
    }));
  nodes.push(...elementNodes);
  if (nodes.length === 0 || (nodes.length === 1 && !!heading)) {
    nodes.push({ type: 'actionLine', content: [] });
  }
  return { type: 'doc', content: nodes };
}

function collectRows(db: Database, query: string): Record<string, unknown>[] {
  try {
    const stmt = db.prepare(query);
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tmpPath = '';

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File) || !file.name.endsWith('.kitsp')) {
      return NextResponse.json(
        { error: 'Only .kitsp files are supported' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const SQL = await loadSqlJs();
    const db = new SQL.Database(new Uint8Array(bytes));

    // 1. Metadata
    const metaRows = collectRows(db, 'SELECT data_name, data_value FROM scenario_data');
    const meta: Record<string, string | null> = {};
    for (const row of metaRows) {
      const key = row.data_name as string | null;
      const val = row.data_value as string | null;
      if (key) meta[key] = val;
    }

    // 2. Scenario XML
    const scenarioRows = collectRows(db, 'SELECT text FROM scenario WHERE id = 1');
    const xmlText = (scenarioRows[0]?.text as string | undefined) ?? '';

    // 3. Research: characters (type=101) and locations (type=201)
    const researchRows = collectRows(
      db,
      'SELECT type, name FROM research WHERE name IS NOT NULL AND name != "" ORDER BY sort_order'
    );

    // 3b. Cards (scenario_cards table — collectRows returns [] if table doesn't exist)
    const cardRows = collectRows(db, 'SELECT title, description, stamp_color FROM scenario_cards ORDER BY id');

    db.close();

    // 4. Parse scenes
    const scenes = parseKitspXML(xmlText);

    // 5. Create Screenplay
    const title =
      (meta['name'] && meta['name'].trim()) ||
      file.name.replace(/\.kitsp$/i, '') ||
      'Imported Screenplay';

    const genre = meta['genre']
      ? meta['genre'].split(',').map((g) => g.trim()).filter(Boolean)
      : [];

    const screenplay = await prisma.screenplay.create({
      data: {
        ownerId: session.user.id,
        title,
        type: 'FILM',
        genre,
        logline: meta['logline'] || null,
        synopsis: meta['synopsis'] || null,
      },
    });

    // 6. Default Act → Structure → Sequence
    const act = await prisma.act.create({
      data: { screenplayId: screenplay.id, title: 'Act One', order: 1 },
    });
    const structure = await prisma.structure.create({
      data: { actId: act.id, title: 'Imported', order: 1 },
    });
    const sequence = await prisma.sequence.create({
      data: { structureId: structure.id, title: 'Imported Scenes', order: 1 },
    });

    // 7. Create Locations (type=201) + index by uppercase name
    const kitLocations = researchRows.filter((r) => r.type === 201);
    const locationByName = new Map<string, string>();
    let locCount = 0;
    for (const loc of kitLocations) {
      const name = (loc.name as string | null)?.trim();
      if (!name) continue;
      try {
        const created = await prisma.location.create({
          data: {
            name: name.toUpperCase(),
            screenplayId: screenplay.id,
          },
        });
        locationByName.set(name.toUpperCase(), created.id);
        locCount++;
      } catch {
        /* duplicate ignore */
      }
    }

    // 8. Create Characters (type=101)
    const kitCharacters = researchRows.filter((r) => r.type === 101);
    let charCount = 0;
    for (const char of kitCharacters) {
      const name = (char.name as string | null)?.trim();
      if (!name) continue;
      try {
        await prisma.character.create({
          data: {
            name: name.toUpperCase(),
            screenplayId: screenplay.id,
          },
        });
        charCount++;
      } catch {
        /* duplicate ignore */
      }
    }

    // 9. Create Scenes
    let sceneCount = 0;
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.heading && scene.elements.length === 0) continue;

      const { intExt, locationName, timeOfDay } = parseSceneHeading(scene.heading ?? '');
      const tiptapContent = buildTiptapJSON(scene.heading, scene.elements);

      // Auto-create location if missing
      let locationId: string | null = locationByName.get(locationName) ?? null;
      if (!locationId && locationName && locationName !== 'LOCATION') {
        try {
          const newLoc = await prisma.location.create({
            data: { name: locationName, screenplayId: screenplay.id, intExt },
          });
          locationId = newLoc.id;
          locationByName.set(locationName, newLoc.id);
          locCount++;
        } catch {
          /* ignore */
        }
      }

      try {
        await prisma.scene.create({
          data: {
            sequenceId: sequence.id,
            sceneNumber: i + 1,
            intExt,
            timeOfDay,
            locationId,
            content: tiptapContent,
          },
        });
        sceneCount++;
      } catch (e) {
        console.error(`Scene ${i + 1} create error:`, e);
      }
    }

    // 10. Import Cards
    let cardCount = 0;
    for (let i = 0; i < cardRows.length; i++) {
      const card = cardRows[i];
      const title = (card.title as string | null)?.trim();
      if (!title) continue;
      try {
        await prisma.card.create({
          data: {
            screenplayId: screenplay.id,
            title,
            description: (card.description as string | null) || undefined,
            color: (card.stamp_color as string | null) || '#6B7280',
            order: i,
          },
        });
        cardCount++;
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      success: true,
      screenplayId: screenplay.id,
      scenesImported: sceneCount,
      charactersImported: charCount,
      locationsImported: locCount,
      cardsImported: cardCount,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Import error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('KIT import error:', error);
    return NextResponse.json(
      { error: msg, stack: process.env.NODE_ENV === 'production' ? stack?.split('\n').slice(0, 5).join('\n') : stack },
      { status: 500 }
    );
  } finally {
    if (tmpPath) {
      try {
        await fs.promises.unlink(tmpPath);
      } catch {
        /* ignore */
      }
    }
  }
}
