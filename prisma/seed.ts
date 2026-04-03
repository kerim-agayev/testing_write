import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Prisma v7: use adapter-based connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {

  // Create admin user
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@scriptflow.com' },
    update: {},
    create: {
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@scriptflow.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      preferredLocale: 'az',
      preferredTheme: 'system',
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  // Create demo screenplay
  const demoScreenplay = await prisma.screenplay.upsert({
    where: { id: 'demo-screenplay-001' },
    update: {},
    create: {
      id: 'demo-screenplay-001',
      ownerId: admin.id,
      title: 'The Last Archive',
      type: 'FILM',
      genre: ['Drama', 'Thriller'],
      logline: 'A reclusive archivist discovers that the manuscripts she has been preserving hold the key to a conspiracy that could rewrite history.',
      isDemo: true,
    },
  });

  // Create acts for the demo
  const act1 = await prisma.act.create({
    data: {
      screenplayId: demoScreenplay.id,
      title: 'Act One',
      order: 1,
    },
  }).catch(async () => {
    return prisma.act.findFirst({ where: { screenplayId: demoScreenplay.id, order: 1 } });
  });

  await prisma.act.create({
    data: { screenplayId: demoScreenplay.id, title: 'Act Two', order: 2 },
  }).catch(() => {});

  await prisma.act.create({
    data: { screenplayId: demoScreenplay.id, title: 'Act Three', order: 3 },
  }).catch(() => {});

  // Create structure for Act 1
  const structure1 = await prisma.structure.create({
    data: { actId: act1!.id, title: 'Setup', order: 1 },
  }).catch(async () => {
    return prisma.structure.findFirst({ where: { actId: act1!.id, order: 1 } });
  });

  // Create sequence
  const sequence1 = await prisma.sequence.create({
    data: { structureId: structure1!.id, title: 'Opening', order: 1 },
  }).catch(async () => {
    return prisma.sequence.findFirst({ where: { structureId: structure1!.id, order: 1 } });
  });

  // Create demo location
  const location = await prisma.location.upsert({
    where: { screenplayId_name: { screenplayId: demoScreenplay.id, name: 'NATIONAL ARCHIVE - BASEMENT' } },
    update: {},
    create: {
      screenplayId: demoScreenplay.id,
      name: 'NATIONAL ARCHIVE - BASEMENT',
      intExt: 'INT',
      description: 'A dimly lit basement filled with rows of ancient manuscripts and dusty shelves.',
    },
  });

  // Create demo scene
  await prisma.scene.create({
    data: {
      sequenceId: sequence1!.id,
      sceneNumber: 1,
      intExt: 'INT',
      locationId: location.id,
      timeOfDay: 'NIGHT',
      content: {
        type: 'doc',
        content: [
          { type: 'sceneHeading', content: [{ type: 'text', text: 'INT. NATIONAL ARCHIVE - BASEMENT - NIGHT' }] },
          { type: 'action', content: [{ type: 'text', text: 'Rows of ancient manuscripts line the walls. A single desk lamp illuminates ELENA VASQUEZ (35), meticulous, guarded, as she carefully turns the pages of a centuries-old tome.' }] },
          { type: 'characterName', attrs: { characterId: null }, content: [{ type: 'text', text: 'ELENA' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "This can't be right..." }] },
        ],
      },
      synopsis: 'Elena discovers an anomaly in an ancient manuscript.',
      storyEvent: 'Elena discovers a hidden message in an ancient manuscript.',
      valueShift: 'Routine → Discovery',
      polarityShift: 'NEG_TO_POS',
      turnOn: 'REVELATION',
      turningPoint: false,
      storyValueScore: 60,
    },
  }).catch(() => console.log('Demo scene already exists'));

  // Create demo characters
  await prisma.character.upsert({
    where: { screenplayId_name: { screenplayId: demoScreenplay.id, name: 'Elena Vasquez' } },
    update: {},
    create: {
      screenplayId: demoScreenplay.id,
      name: 'Elena Vasquez',
      roleType: 'PROTAGONIST',
      isMajor: true,
      age: 35,
      traits: ['Meticulous', 'Guarded', 'Brilliant', 'Obsessive'],
      personality: 'A perfectionist who finds comfort in the certainty of historical records.',
      biography: 'Elena grew up in a family of academics. Her mother was a renowned historian who disappeared under mysterious circumstances when Elena was 16.',
    },
  });

  await prisma.character.upsert({
    where: { screenplayId_name: { screenplayId: demoScreenplay.id, name: 'Marcus Webb' } },
    update: {},
    create: {
      screenplayId: demoScreenplay.id,
      name: 'Marcus Webb',
      roleType: 'ANTAGONIST',
      isMajor: true,
      age: 52,
      traits: ['Charismatic', 'Ruthless', 'Cultured', 'Manipulative'],
      personality: 'A powerful collector who views history as a commodity.',
      biography: 'A self-made billionaire who built his fortune in media. Marcus has spent decades acquiring rare manuscripts and artifacts.',
    },
  });

  console.log(`Demo screenplay created: ${demoScreenplay.title}`);
  console.log('Seed completed successfully!');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
