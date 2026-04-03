import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function buildSceneContent(blocks: Array<{ type: string; text?: string; characterId?: string | null }>) {
  return {
    type: 'doc',
    content: blocks.map(block => ({
      type: block.type,
      content: block.text ? [{ type: 'text', text: block.text }] : [],
      attrs: block.characterId !== undefined ? { characterId: block.characterId } : {},
    })),
  };
}

async function seedDemoScreenplay() {
  console.log('Seeding Harry Potter demo screenplay...');

  // 1. Find admin
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.error('No admin user found. Create an admin first.');
    process.exit(1);
  }

  // 2. Clean old demo
  const oldDemo = await prisma.screenplay.findFirst({ where: { isDemo: true } });
  if (oldDemo) {
    await prisma.screenplay.delete({ where: { id: oldDemo.id } });
    console.log('Deleted old demo screenplay.');
  }

  // 3. Create screenplay
  const screenplay = await prisma.screenplay.create({
    data: {
      ownerId: admin.id,
      title: "Harry Potter and the Philosopher's Stone",
      type: 'FILM',
      genre: ['Fantasy', 'Adventure', 'Coming of Age'],
      logline: 'An orphaned boy discovers he is a wizard and must confront the dark forces that killed his parents while navigating his first year at a magical school.',
      isDemo: true,
    },
  });

  // 4. Characters
  const harry = await prisma.character.create({ data: {
    screenplayId: screenplay.id, name: 'HARRY POTTER', roleType: 'PROTAGONIST', isMajor: true, age: 11,
    traits: ['Brave', 'Loyal', 'Curious', 'Humble', 'Impulsive'],
    personality: 'Harry is defined by his innate goodness and resilience. Raised in neglect, he carries no arrogance despite extraordinary destiny.',
    biography: 'Harry James Potter, orphaned at age 1 when Voldemort murdered his parents. Raised by the Dursleys in a cupboard under the stairs. His internal journey: from believing he is worthless → discovering he belongs → accepting his destiny.',
  }});
  const hermione = await prisma.character.create({ data: {
    screenplayId: screenplay.id, name: 'HERMIONE GRANGER', roleType: 'SUPPORTING', isMajor: true, age: 11,
    traits: ['Intelligent', 'Rule-following', 'Loyal', 'Anxious', 'Brave'],
    personality: 'Hermione uses intellect as armor. Her arc: from isolated know-it-all → learning that friendship matters more than following rules.',
  }});
  const ron = await prisma.character.create({ data: {
    screenplayId: screenplay.id, name: 'RON WEASLEY', roleType: 'SUPPORTING', isMajor: true, age: 11,
    traits: ['Loyal', 'Humorous', 'Insecure', 'Brave', 'Self-doubting'],
    personality: 'Ron struggles with being overshadowed by brothers. His arc: from insecure sidekick → realizing his own worth.',
  }});
  const quirrell = await prisma.character.create({ data: {
    screenplayId: screenplay.id, name: 'PROFESSOR QUIRRELL / VOLDEMORT', roleType: 'ANTAGONIST', isMajor: true, age: 35,
    traits: ['Deceptive', 'Cowardly', 'Obsessive', 'Ruthless'],
    personality: 'Quirrell chose power over principle, allowing Voldemort to possess him.',
  }});
  const dumbledore = await prisma.character.create({ data: {
    screenplayId: screenplay.id, name: 'DUMBLEDORE', roleType: 'SUPPORTING', isMajor: false, age: 115,
    traits: ['Wise', 'Mysterious', 'Protective', 'Strategic'],
  }});
  const hagrid = await prisma.character.create({ data: {
    screenplayId: screenplay.id, name: 'HAGRID', roleType: 'SUPPORTING', isMajor: false, age: 63,
    traits: ['Warm', 'Loyal', 'Emotional'],
  }});

  // 5. Structure: 3 Acts
  const act1 = await prisma.act.create({ data: { screenplayId: screenplay.id, title: 'Act One: The Ordinary World', order: 1 } });
  const act1_s1 = await prisma.structure.create({ data: { actId: act1.id, title: 'Setup', order: 1 } });
  const act1_s2 = await prisma.structure.create({ data: { actId: act1.id, title: 'Inciting Incident', order: 2 } });
  const seq1 = await prisma.sequence.create({ data: { structureId: act1_s1.id, title: 'Privet Drive', order: 1 } });
  const seq2 = await prisma.sequence.create({ data: { structureId: act1_s2.id, title: 'The Letters & Hagrid', order: 1 } });
  const seq3 = await prisma.sequence.create({ data: { structureId: act1_s2.id, title: 'Diagon Alley & Platform 9¾', order: 2 } });

  const act2 = await prisma.act.create({ data: { screenplayId: screenplay.id, title: 'Act Two: The Magical World', order: 2 } });
  const act2_s1 = await prisma.structure.create({ data: { actId: act2.id, title: 'New World', order: 1 } });
  const act2_s2 = await prisma.structure.create({ data: { actId: act2.id, title: 'Complications & Rising Stakes', order: 2 } });
  const act2_s3 = await prisma.structure.create({ data: { actId: act2.id, title: 'Midpoint', order: 3 } });
  const seq4 = await prisma.sequence.create({ data: { structureId: act2_s1.id, title: 'Hogwarts Arrival', order: 1 } });
  const seq5 = await prisma.sequence.create({ data: { structureId: act2_s2.id, title: 'Quidditch & Mysteries', order: 1 } });
  const seq6 = await prisma.sequence.create({ data: { structureId: act2_s3.id, title: 'Norbert & Forbidden Forest', order: 1 } });

  const act3 = await prisma.act.create({ data: { screenplayId: screenplay.id, title: "Act Three: The Philosopher's Stone", order: 3 } });
  const act3_s1 = await prisma.structure.create({ data: { actId: act3.id, title: 'Climax', order: 1 } });
  const act3_s2 = await prisma.structure.create({ data: { actId: act3.id, title: 'Resolution', order: 2 } });
  const seq7 = await prisma.sequence.create({ data: { structureId: act3_s1.id, title: 'The Gauntlet', order: 1 } });
  const seq8 = await prisma.sequence.create({ data: { structureId: act3_s2.id, title: 'Aftermath & Feast', order: 1 } });

  // 6. Scenes with full screenplay content
  const sceneData = [
    { seqId: seq1.id, num: 1, ie: 'EXT' as const, tod: 'NIGHT', loc: 'PRIVET DRIVE - NUMBER FOUR',
      event: 'Dumbledore and McGonagall arrive; baby Harry is left on the doorstep.',
      vs: 'Safety → Danger → Bittersweet Safety', ps: 'NEG_TO_POS' as const, to: 'REVELATION' as const, tp: true, sv: 35,
      chars: [hagrid.id, dumbledore.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'EXT. PRIVET DRIVE - NIGHT' },
        { type: 'action', text: 'A tabby cat sits on a garden wall. DUMBLEDORE appears, clicks his Deluminator. Streetlamps go out.' },
        { type: 'characterName', text: 'DUMBLEDORE', characterId: dumbledore.id },
        { type: 'dialogue', text: "I should have known that you would be here, Professor McGonagall." },
        { type: 'action', text: 'HAGRID arrives on a flying motorbike, an INFANT in his arms. BABY HARRY has a lightning-bolt scar.' },
        { type: 'characterName', text: 'DUMBLEDORE', characterId: dumbledore.id },
        { type: 'dialogue', text: 'Good luck, Harry Potter.' },
      ]),
    },
    { seqId: seq1.id, num: 2, ie: 'INT' as const, tod: 'MORNING', loc: 'CUPBOARD UNDER THE STAIRS',
      event: "Harry wakes in his cupboard. Spider webs are his decorations.",
      vs: 'Survival → Suppressed Longing', ps: 'NEG_TO_NEG' as const, to: 'ACTION' as const, tp: false, sv: 20,
      chars: [harry.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'INT. CUPBOARD UNDER THE STAIRS - MORNING' },
        { type: 'action', text: 'HARRY POTTER, 10, lies cramped in a tiny cupboard. Thin, round glasses patched with tape.' },
        { type: 'characterName', text: 'UNCLE VERNON (O.S.)' },
        { type: 'dialogue', text: 'Up! Get up! Now!' },
      ]),
    },
    { seqId: seq2.id, num: 3, ie: 'INT' as const, tod: 'DAY', loc: 'DURSLEY HOUSE - KITCHEN',
      event: 'The first Hogwarts letter arrives. The Dursleys panic.',
      vs: 'Ignorance → Curiosity → Blocked', ps: 'NEG_TO_NEG' as const, to: 'REVELATION' as const, tp: true, sv: 40,
      chars: [harry.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'INT. DURSLEY HOUSE - KITCHEN - MORNING' },
        { type: 'action', text: 'A FLOOD of cream-colored envelopes pours through the letterbox, addressed in emerald-green ink.' },
        { type: 'characterName', text: 'HARRY', characterId: harry.id },
        { type: 'parenthetical', text: 'stunned' },
        { type: 'dialogue', text: 'This — this is for me?' },
      ]),
    },
    { seqId: seq2.id, num: 4, ie: 'EXT' as const, tod: 'NIGHT', loc: 'HUT ON THE ROCK',
      event: "Hagrid smashes down the door and tells Harry he's a wizard.",
      vs: 'Powerlessness → Identity Revealed', ps: 'NEG_TO_POS' as const, to: 'REVELATION' as const, tp: true, sv: 85,
      chars: [harry.id, hagrid.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'EXT. HUT ON THE ROCK - STORMY NIGHT' },
        { type: 'action', text: 'BOOM. The door FLIES OFF ITS HINGES. HAGRID stands in the doorway, massive, holding a crumpled birthday cake.' },
        { type: 'characterName', text: 'HAGRID', characterId: hagrid.id },
        { type: 'dialogue', text: "Yer a wizard, Harry." },
        { type: 'characterName', text: 'HARRY', characterId: harry.id },
        { type: 'dialogue', text: "I'm a what?" },
      ]),
    },
    { seqId: seq3.id, num: 5, ie: 'EXT' as const, tod: 'DAY', loc: 'DIAGON ALLEY',
      event: 'Harry discovers the magical world, buys school supplies.',
      vs: 'Poverty → Abundance → Overwhelm', ps: 'NEG_TO_POS' as const, to: 'ACTION' as const, tp: false, sv: 75,
      chars: [harry.id, hagrid.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'EXT. DIAGON ALLEY - DAY' },
        { type: 'action', text: "The wall folds back to reveal a cobblestoned street teeming with witches and wizards." },
        { type: 'characterName', text: 'HARRY', characterId: harry.id },
        { type: 'dialogue', text: "It's all real? All of it?" },
      ]),
    },
    { seqId: seq4.id, num: 6, ie: 'INT' as const, tod: 'EVENING', loc: 'HOGWARTS - GREAT HALL',
      event: 'The Sorting Ceremony. Harry is placed in Gryffindor.',
      vs: 'Uncertainty → Belonging', ps: 'NEG_TO_POS' as const, to: 'ACTION' as const, tp: true, sv: 80,
      chars: [harry.id, hermione.id, ron.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'INT. HOGWARTS - GREAT HALL - EVENING' },
        { type: 'action', text: 'Hundreds of candles float in mid-air above four long tables.' },
        { type: 'characterName', text: 'HARRY', characterId: harry.id },
        { type: 'parenthetical', text: 'under his breath' },
        { type: 'dialogue', text: 'Not Slytherin. Not Slytherin.' },
        { type: 'action', text: 'The Gryffindor table ERUPTS.' },
      ]),
    },
    { seqId: seq5.id, num: 7, ie: 'INT' as const, tod: 'DAY', loc: 'HOGWARTS - CORRIDOR',
      event: "Ron's careless remark hurts Hermione; a troll enters the school.",
      vs: 'Social Tension → Crisis', ps: 'NEG_TO_NEG' as const, to: 'ACTION' as const, tp: false, sv: 45,
      chars: [harry.id, hermione.id, ron.id, quirrell.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'INT. HOGWARTS - CORRIDOR - HALLOWEEN DAY' },
        { type: 'characterName', text: 'RON', characterId: ron.id },
        { type: 'dialogue', text: "She's a nightmare, honestly. No wonder she hasn't got any friends." },
        { type: 'characterName', text: 'QUIRRELL', characterId: quirrell.id },
        { type: 'dialogue', text: 'Troll — in the dungeon! Thought you ought to know.' },
      ]),
    },
    { seqId: seq5.id, num: 8, ie: 'INT' as const, tod: 'NIGHT', loc: "GIRLS' BATHROOM",
      event: 'Harry and Ron fight the troll to save Hermione. A friendship is forged.',
      vs: 'Danger → Survival → Brotherhood', ps: 'NEG_TO_POS' as const, to: 'ACTION' as const, tp: true, sv: 70,
      chars: [harry.id, hermione.id, ron.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: "INT. GIRLS' BATHROOM - NIGHT" },
        { type: 'action', text: 'A MOUNTAIN TROLL smashes sinks. HERMIONE screams. Harry LEAPS and grabs the club.' },
        { type: 'characterName', text: 'RON', characterId: ron.id },
        { type: 'dialogue', text: 'Wingardium Leviosa!' },
        { type: 'action', text: 'The club levitates. Drops on the troll. Three become friends.' },
      ]),
    },
    { seqId: seq6.id, num: 9, ie: 'EXT' as const, tod: 'NIGHT', loc: 'FORBIDDEN FOREST',
      event: 'Harry encounters Voldemort feeding on a dead unicorn.',
      vs: 'Courage → Terror → Resolve', ps: 'POS_TO_NEG' as const, to: 'REVELATION' as const, tp: true, sv: 25,
      chars: [harry.id, quirrell.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'EXT. FORBIDDEN FOREST - NIGHT' },
        { type: 'action', text: 'A CLOAKED FIGURE crawls toward a DEAD UNICORN and DRINKS from the wound.' },
        { type: 'characterName', text: 'HARRY', characterId: harry.id },
        { type: 'dialogue', text: 'Voldemort?' },
      ]),
    },
    { seqId: seq7.id, num: 10, ie: 'INT' as const, tod: 'NIGHT', loc: 'UNDERGROUND CHAMBERS',
      event: "Harry, Ron, Hermione pass the challenges. Ron sacrifices himself at chess.",
      vs: 'Fear → Teamwork → Sacrifice', ps: 'NEG_TO_POS' as const, to: 'ACTION' as const, tp: true, sv: 60,
      chars: [harry.id, hermione.id, ron.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'INT. UNDERGROUND CHAMBERS - NIGHT' },
        { type: 'action', text: "Devil's Snare. Flying keys. A giant chessboard." },
        { type: 'characterName', text: 'RON', characterId: ron.id },
        { type: 'dialogue', text: "That's chess. Go. It's what you have to do. Go!" },
      ]),
    },
    { seqId: seq7.id, num: 11, ie: 'INT' as const, tod: 'NIGHT', loc: 'MIRROR OF ERISED CHAMBER',
      event: 'Harry confronts Quirrell/Voldemort. His pure motive saves the Stone.',
      vs: 'Doom → Sacrifice → Victory', ps: 'NEG_TO_POS' as const, to: 'ACTION' as const, tp: true, sv: 95,
      chars: [harry.id, quirrell.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'INT. MIRROR OF ERISED CHAMBER - NIGHT' },
        { type: 'characterName', text: 'VOLDEMORT', characterId: quirrell.id },
        { type: 'dialogue', text: 'Harry Potter. We meet again.' },
        { type: 'action', text: "Quirrell grabs Harry's wrist. His skin BLISTERS and BURNS. Quirrell crumbles." },
      ]),
    },
    { seqId: seq8.id, num: 12, ie: 'INT' as const, tod: 'DAY', loc: 'HOGWARTS - HOSPITAL WING',
      event: 'Harry wakes to find Dumbledore. The Stone is destroyed.',
      vs: 'Uncertainty → Peace → Belonging', ps: 'POS_TO_POS' as const, to: 'REVELATION' as const, tp: false, sv: 90,
      chars: [harry.id, dumbledore.id],
      content: buildSceneContent([
        { type: 'sceneHeading', text: 'INT. HOGWARTS - HOSPITAL WING - DAY' },
        { type: 'characterName', text: 'DUMBLEDORE', characterId: dumbledore.id },
        { type: 'dialogue', text: "To have been loved so deeply, even though the person who loved us is gone, will give us some protection forever." },
      ]),
    },
  ];

  for (const s of sceneData) {
    const location = await prisma.location.upsert({
      where: { screenplayId_name: { screenplayId: screenplay.id, name: s.loc } },
      create: { screenplayId: screenplay.id, name: s.loc, intExt: s.ie },
      update: {},
    });

    const scene = await prisma.scene.create({
      data: {
        sequenceId: s.seqId, sceneNumber: s.num, intExt: s.ie, locationId: location.id,
        timeOfDay: s.tod, content: s.content, storyEvent: s.event,
        valueShift: s.vs, polarityShift: s.ps, turnOn: s.to, turningPoint: s.tp, storyValueScore: s.sv,
      },
    });

    for (const charId of s.chars) {
      await prisma.sceneCharacter.create({ data: { sceneId: scene.id, characterId: charId } });
    }
  }

  // 7. Character Arc Scores
  const allScenes = await prisma.scene.findMany({
    where: { sequence: { structure: { act: { screenplayId: screenplay.id } } } },
    select: { id: true, sceneNumber: true },
    orderBy: { sceneNumber: 'asc' },
  });
  const sceneMap = Object.fromEntries(allScenes.map(s => [s.sceneNumber, s.id]));

  const arcData = [
    // Harry (External: wizardry, Internal: identity/belonging)
    { cid: harry.id, sn: 1, ext: 10, int: 5 }, { cid: harry.id, sn: 2, ext: 8, int: 10 },
    { cid: harry.id, sn: 3, ext: 15, int: 30 }, { cid: harry.id, sn: 4, ext: 30, int: 70 },
    { cid: harry.id, sn: 5, ext: 45, int: 75 }, { cid: harry.id, sn: 6, ext: 55, int: 85 },
    { cid: harry.id, sn: 7, ext: 50, int: 60 }, { cid: harry.id, sn: 8, ext: 65, int: 80 },
    { cid: harry.id, sn: 9, ext: 40, int: 65 }, { cid: harry.id, sn: 10, ext: 70, int: 85 },
    { cid: harry.id, sn: 11, ext: 85, int: 95 }, { cid: harry.id, sn: 12, ext: 80, int: 100 },
    // Hermione
    { cid: hermione.id, sn: 6, ext: 70, int: 15 }, { cid: hermione.id, sn: 7, ext: 72, int: 10 },
    { cid: hermione.id, sn: 8, ext: 75, int: 60 }, { cid: hermione.id, sn: 10, ext: 85, int: 85 },
    // Ron
    { cid: ron.id, sn: 6, ext: 45, int: 30 }, { cid: ron.id, sn: 7, ext: 47, int: 20 },
    { cid: ron.id, sn: 8, ext: 55, int: 55 }, { cid: ron.id, sn: 10, ext: 60, int: 80 },
  ];

  for (const a of arcData) {
    const sceneId = sceneMap[a.sn];
    if (!sceneId) continue;
    await prisma.characterArc.upsert({
      where: { characterId_sceneId: { characterId: a.cid, sceneId } },
      create: { characterId: a.cid, sceneId, externalScore: a.ext, internalScore: a.int },
      update: { externalScore: a.ext, internalScore: a.int },
    });
  }

  console.log('Harry Potter demo screenplay seeded successfully!');
  console.log(`  - ${sceneData.length} scenes`);
  console.log(`  - 6 characters (4 major)`);
  console.log(`  - ${arcData.length} arc data points`);
}

seedDemoScreenplay()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
