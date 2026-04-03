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

  // Remove old demo if exists
  await prisma.screenplay.deleteMany({ where: { isDemo: true } });

  // Create HP demo screenplay
  const demo = await prisma.screenplay.create({
    data: {
      id: 'demo-hp-001',
      ownerId: admin.id,
      title: "Harry Potter and the Philosopher's Stone",
      type: 'FILM',
      genre: ['Fantasy', 'Adventure'],
      logline: 'An orphaned boy discovers he is a wizard and is invited to attend Hogwarts School of Witchcraft and Wizardry.',
      isDemo: true,
    },
  });

  // Structure: Act 1
  const act1 = await prisma.act.create({
    data: { screenplayId: demo.id, title: 'Act One', order: 1 },
  });
  const act2 = await prisma.act.create({
    data: { screenplayId: demo.id, title: 'Act Two', order: 2 },
  });

  const struct1 = await prisma.structure.create({
    data: { actId: act1.id, title: 'Setup', order: 1 },
  });
  const struct2 = await prisma.structure.create({
    data: { actId: act1.id, title: 'Inciting Incident', order: 2 },
  });
  const struct3 = await prisma.structure.create({
    data: { actId: act2.id, title: 'Rising Action', order: 1 },
  });

  const seq1 = await prisma.sequence.create({
    data: { structureId: struct1.id, title: 'Privet Drive', order: 1 },
  });
  const seq2 = await prisma.sequence.create({
    data: { structureId: struct2.id, title: 'Hagrid Arrives', order: 1 },
  });
  const seq3 = await prisma.sequence.create({
    data: { structureId: struct3.id, title: 'The Wizarding World', order: 1 },
  });

  // Locations
  const loc1 = await prisma.location.create({
    data: { screenplayId: demo.id, name: 'PRIVET DRIVE - CUPBOARD UNDER THE STAIRS', intExt: 'INT' },
  });
  const loc2 = await prisma.location.create({
    data: { screenplayId: demo.id, name: 'HUT ON THE ROCK', intExt: 'INT' },
  });
  const loc3 = await prisma.location.create({
    data: { screenplayId: demo.id, name: 'DIAGON ALLEY', intExt: 'EXT' },
  });
  const loc4 = await prisma.location.create({
    data: { screenplayId: demo.id, name: "KING'S CROSS STATION - PLATFORM 9 3/4", intExt: 'INT' },
  });
  const loc5 = await prisma.location.create({
    data: { screenplayId: demo.id, name: 'HOGWARTS - GREAT HALL', intExt: 'INT' },
  });

  // Characters
  const harry = await prisma.character.create({
    data: {
      screenplayId: demo.id, name: 'Harry Potter', roleType: 'PROTAGONIST', isMajor: true,
      age: 11, traits: ['Brave', 'Curious', 'Humble', 'Loyal'],
      personality: 'An orphan who has been mistreated but retains an innate sense of courage and fairness.',
      biography: 'Harry Potter has lived under the stairs at 4 Privet Drive for as long as he can remember, raised by his cruel aunt and uncle, the Dursleys. He has no idea he is famous in the wizarding world.',
    },
  });
  const hagrid = await prisma.character.create({
    data: {
      screenplayId: demo.id, name: 'Rubeus Hagrid', roleType: 'SUPPORTING', isMajor: true,
      age: 63, traits: ['Gentle', 'Loyal', 'Clumsy', 'Warm-hearted'],
      personality: 'A half-giant with a heart of gold who is fiercely loyal to Dumbledore.',
    },
  });
  const dumbledore = await prisma.character.create({
    data: {
      screenplayId: demo.id, name: 'Albus Dumbledore', roleType: 'SUPPORTING', isMajor: true,
      age: 115, traits: ['Wise', 'Enigmatic', 'Powerful', 'Compassionate'],
      personality: 'The greatest wizard alive, who speaks in riddles and always has a plan.',
    },
  });
  const ron = await prisma.character.create({
    data: {
      screenplayId: demo.id, name: 'Ron Weasley', roleType: 'SUPPORTING', isMajor: true,
      age: 11, traits: ['Funny', 'Loyal', 'Insecure', 'Brave'],
      personality: 'The sixth of seven siblings, Ron is overshadowed but fiercely loyal to his friends.',
    },
  });
  const hermione = await prisma.character.create({
    data: {
      screenplayId: demo.id, name: 'Hermione Granger', roleType: 'SUPPORTING', isMajor: false,
      age: 11, traits: ['Brilliant', 'Bossy', 'Determined', 'Kind'],
    },
  });

  // Scene 1: Privet Drive
  const scene1 = await prisma.scene.create({
    data: {
      sequenceId: seq1.id, sceneNumber: 1, intExt: 'INT', locationId: loc1.id, timeOfDay: 'MORNING',
      synopsis: 'Harry wakes up in his cupboard under the stairs.',
      storyEvent: 'Harry is woken by Aunt Petunia and told to cook breakfast for Dudley\'s birthday.',
      valueShift: 'Oppression → Resignation', polarityShift: 'NEG_TO_NEG', turnOn: 'ACTION', turningPoint: false, storyValueScore: 20,
      content: {
        type: 'doc',
        content: [
          { type: 'sceneHeading', content: [{ type: 'text', text: 'INT. PRIVET DRIVE - CUPBOARD UNDER THE STAIRS - MORNING' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'A tiny cupboard under a staircase. Spiders crawl across the ceiling. HARRY POTTER (11), small for his age, messy black hair, round glasses, sleeps on a thin mattress. A BANG on the door jolts him awake.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'AUNT PETUNIA (O.S.)' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Up! Get up! Now!' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'Harry fumbles for his glasses. Dust falls from the ceiling as DUDLEY thunders down the stairs above, each step shaking the cupboard.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'parenthetical', content: [{ type: 'text', text: '(to himself)' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Happy birthday, Dudley...' }] },
        ],
      },
    },
  });

  // Scene 2: Hagrid arrives
  const scene2 = await prisma.scene.create({
    data: {
      sequenceId: seq2.id, sceneNumber: 2, intExt: 'INT', locationId: loc2.id, timeOfDay: 'NIGHT',
      synopsis: 'Hagrid bursts in and tells Harry he\'s a wizard.',
      storyEvent: 'Hagrid breaks down the door and delivers Harry\'s Hogwarts letter.',
      valueShift: 'Ignorance → Revelation', polarityShift: 'NEG_TO_POS', turnOn: 'REVELATION', turningPoint: true, storyValueScore: 85,
      content: {
        type: 'doc',
        content: [
          { type: 'sceneHeading', content: [{ type: 'text', text: 'INT. HUT ON THE ROCK - NIGHT' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'A decrepit hut on a rock in the middle of the sea. Rain lashes the windows. Harry draws a birthday cake in the dust on the floor. The clock strikes midnight.' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'BOOM. The door shudders. BOOM. It flies off its hinges. A GIANT of a man fills the doorway — RUBEUS HAGRID, wild beard, beetle-black eyes, kind.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HAGRID' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "Sorry 'bout that." }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'Hagrid squeezes inside. He looks down at Harry with tremendous warmth.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HAGRID' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "Harry! Las' time I saw you, you was only a baby. Yeh look a lot like yer dad, but yeh've got yer mum's eyes." }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'I\'m sorry — who are you?' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HAGRID' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "Rubeus Hagrid, Keeper of Keys and Grounds at Hogwarts. Course, you'll know all about Hogwarts." }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "Sorry — no." }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HAGRID' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "No? Blimey, Harry, didn't yeh ever wonder where yer mum and dad learned it all?" }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Learned what?' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HAGRID' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "Yer a wizard, Harry." }] },
        ],
      },
    },
  });

  // Scene 3: Diagon Alley
  const scene3 = await prisma.scene.create({
    data: {
      sequenceId: seq3.id, sceneNumber: 3, intExt: 'EXT', locationId: loc3.id, timeOfDay: 'DAY',
      synopsis: 'Harry enters the wizarding world for the first time.',
      storyEvent: 'Hagrid takes Harry to Diagon Alley to buy school supplies.',
      valueShift: 'Ordinary → Magical', polarityShift: 'POS_TO_POS', turnOn: 'ACTION', turningPoint: false, storyValueScore: 75,
      content: {
        type: 'doc',
        content: [
          { type: 'sceneHeading', content: [{ type: 'text', text: 'EXT. DIAGON ALLEY - DAY' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'The brick wall opens like a doorway. Harry steps through and his jaw drops.' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'A cobblestone street packed with witches and wizards. Owls swoop overhead. Cauldrons stack outside shops. Signs for Ollivanders, Flourish and Blotts, Gringotts glitter in the sun.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'parenthetical', content: [{ type: 'text', text: '(breathless)' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'This is... all real?' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HAGRID' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "Welcome to Diagon Alley, Harry." }] },
        ],
      },
    },
  });

  // Scene 4: Platform 9 3/4
  const scene4 = await prisma.scene.create({
    data: {
      sequenceId: seq3.id, sceneNumber: 4, intExt: 'INT', locationId: loc4.id, timeOfDay: 'DAY',
      synopsis: 'Harry meets Ron on the Hogwarts Express.',
      storyEvent: 'Harry runs through the wall to Platform 9 3/4 and meets Ron Weasley.',
      valueShift: 'Loneliness → Friendship', polarityShift: 'NEG_TO_POS', turnOn: 'ACTION', turningPoint: false, storyValueScore: 70,
      content: {
        type: 'doc',
        content: [
          { type: 'sceneHeading', content: [{ type: 'text', text: "INT. KING'S CROSS STATION - PLATFORM 9 3/4 - DAY" }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'A scarlet steam engine — THE HOGWARTS EXPRESS — billows steam across the platform. Students and parents bustle. Harry pushes his trolley, looking overwhelmed.' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'He finds an empty compartment. A moment later, a red-haired boy pokes his head in.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'RON' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Excuse me, d\'you mind? Everywhere else is full.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Not at all.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'RON' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "I'm Ron, by the way. Ron Weasley." }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'dialogue', content: [{ type: 'text', text: "I'm Harry. Harry Potter." }] },
          { type: 'characterName', content: [{ type: 'text', text: 'RON' }] },
          { type: 'parenthetical', content: [{ type: 'text', text: '(eyes wide)' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'So it\'s true? Do you really have the... the scar?' }] },
        ],
      },
    },
  });

  // Scene 5: Sorting Hat
  const scene5 = await prisma.scene.create({
    data: {
      sequenceId: seq3.id, sceneNumber: 5, intExt: 'INT', locationId: loc5.id, timeOfDay: 'NIGHT',
      synopsis: 'The Sorting Hat places Harry in Gryffindor.',
      storyEvent: 'Harry is sorted into Gryffindor after asking the Sorting Hat not to put him in Slytherin.',
      valueShift: 'Fear → Belonging', polarityShift: 'NEG_TO_POS', turnOn: 'REVELATION', turningPoint: true, storyValueScore: 90,
      content: {
        type: 'doc',
        content: [
          { type: 'sceneHeading', content: [{ type: 'text', text: 'INT. HOGWARTS - GREAT HALL - NIGHT' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'Thousands of candles float in the air. Four long tables fill the hall. The ceiling mirrors the night sky — stars and all. PROFESSOR MCGONAGALL places a ratty old hat on a stool.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'MCGONAGALL' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Potter, Harry!' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'Whispers erupt. Harry walks to the stool. The hat is placed on his head.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'SORTING HAT (V.O.)' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Hmm, difficult. Very difficult. Plenty of courage, I see. Not a bad mind, either. There\'s talent — oh yes. And a thirst to prove yourself. But where to put you...' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'HARRY' }] },
          { type: 'parenthetical', content: [{ type: 'text', text: '(whispering)' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Not Slytherin. Not Slytherin.' }] },
          { type: 'characterName', content: [{ type: 'text', text: 'SORTING HAT (V.O.)' }] },
          { type: 'dialogue', content: [{ type: 'text', text: 'Not Slytherin, eh? Are you sure? You could be great, you know... No? Well, if you\'re sure — better be... GRYFFINDOR!' }] },
          { type: 'actionLine', content: [{ type: 'text', text: 'The Gryffindor table ERUPTS. Harry grins — for the first time, he belongs somewhere.' }] },
          { type: 'transition', content: [{ type: 'text', text: 'CUT TO:' }] },
        ],
      },
    },
  });

  // Scene characters
  await prisma.sceneCharacter.createMany({
    data: [
      { sceneId: scene1.id, characterId: harry.id },
      { sceneId: scene2.id, characterId: harry.id },
      { sceneId: scene2.id, characterId: hagrid.id },
      { sceneId: scene3.id, characterId: harry.id },
      { sceneId: scene3.id, characterId: hagrid.id },
      { sceneId: scene4.id, characterId: harry.id },
      { sceneId: scene4.id, characterId: ron.id },
      { sceneId: scene5.id, characterId: harry.id },
      { sceneId: scene5.id, characterId: dumbledore.id },
    ],
  });

  // Character arcs for Harry across all 5 scenes
  await prisma.characterArc.createMany({
    data: [
      { characterId: harry.id, sceneId: scene1.id, externalScore: 10, internalScore: 15 },
      { characterId: harry.id, sceneId: scene2.id, externalScore: 40, internalScore: 55 },
      { characterId: harry.id, sceneId: scene3.id, externalScore: 60, internalScore: 65 },
      { characterId: harry.id, sceneId: scene4.id, externalScore: 55, internalScore: 70 },
      { characterId: harry.id, sceneId: scene5.id, externalScore: 80, internalScore: 85 },
      // Hagrid arcs
      { characterId: hagrid.id, sceneId: scene2.id, externalScore: 70, internalScore: 80 },
      { characterId: hagrid.id, sceneId: scene3.id, externalScore: 75, internalScore: 75 },
      // Ron arc
      { characterId: ron.id, sceneId: scene4.id, externalScore: 50, internalScore: 45 },
    ],
  });

  console.log(`Demo screenplay created: ${demo.title} (5 scenes, 5 characters)`);
  console.log('Seed completed successfully!');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
