// API response types — derived from Prisma models but matching actual API responses

export type UserRole = 'USER' | 'MENTOR' | 'ADMIN';
export type ScreenplayType = 'FILM' | 'SERIES';
export type CharacterRole = 'PROTAGONIST' | 'ANTAGONIST' | 'SUPPORTING' | 'MINOR';
export type IntExt = 'INT' | 'EXT' | 'INT_EXT';
export type PolarityShift = 'POS_TO_POS' | 'POS_TO_NEG' | 'NEG_TO_POS' | 'NEG_TO_NEG' | 'NEUTRAL';
export type TurnOn = 'ACTION' | 'REVELATION';
export type NoteType = 'NOTE' | 'FLAG' | 'MESSAGE';

export type ScreenplayListItem = {
  id: string;
  title: string;
  type: ScreenplayType;
  genre: string[];
  logline: string | null;
  isDemo: boolean;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: { id: string; name: string };
  _count: { collaborators: number };
};

export type ScreenplayFull = {
  id: string;
  title: string;
  type: ScreenplayType;
  genre: string[];
  logline: string | null;
  isDemo: boolean;
  owner: { id: string; name: string; email: string };
  episodes: Episode[];
  acts: ActFull[];
  characters: CharacterSummary[];
  locations: Location[];
  collaborators: Collaborator[];
};

export type Episode = {
  id: string;
  title: string;
  order: number;
  synopsis: string | null;
};

export type ActFull = {
  id: string;
  title: string;
  order: number;
  episodeId: string | null;
  structures: StructureFull[];
};

export type StructureFull = {
  id: string;
  title: string;
  order: number;
  sequences: SequenceFull[];
};

export type SequenceFull = {
  id: string;
  title: string;
  order: number;
  scenes: SceneSummary[];
};

export type SceneSummary = {
  id: string;
  sceneNumber: number;
  intExt: IntExt;
  timeOfDay: string | null;
  synopsis: string | null;
  storyValueScore: number | null;
  locationId: string | null;
};

export type SceneFull = SceneSummary & {
  content: unknown;
  storyEvent: string | null;
  valueShift: string | null;
  polarityShift: PolarityShift | null;
  turnOn: TurnOn | null;
  turningPoint: boolean;
  location: Location | null;
  sceneCharacters: Array<{ character: CharacterSummary }>;
  characterArcs: CharacterArc[];
  mentorNotes: MentorNote[];
};

export type CharacterSummary = {
  id: string;
  name: string;
  roleType: CharacterRole;
  isMajor: boolean;
};

export type CharacterFull = CharacterSummary & {
  age: number | null;
  height: string | null;
  weight: string | null;
  traits: string[];
  personality: string | null;
  biography: string | null;
  arcs: Array<CharacterArc & { scene: { id: string; sceneNumber: number; synopsis: string | null } }>;
  sceneCharacters: Array<{ scene: { id: string; sceneNumber: number; synopsis: string | null } }>;
};

export type CharacterArc = {
  id: string;
  characterId: string;
  sceneId: string;
  externalScore: number;
  internalScore: number;
};

export type Location = {
  id: string;
  name: string;
  intExt: IntExt;
  description: string | null;
};

export type Collaborator = {
  screenplayId: string;
  userId: string;
  role: 'CO_WRITER' | 'VIEWER';
  invitedAt: string;
  acceptedAt: string | null;
  user: { id: string; name: string; email: string };
};

export type MentorNote = {
  id: string;
  mentorId: string;
  content: string;
  type: NoteType;
  flagReason: string | null;
  isRead: boolean;
  createdAt: string;
  mentor: { id: string; name: string };
};

export type AdminStats = {
  totalUsers: number;
  totalScreenplays: number;
  totalScenes: number;
  activeThisWeek: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  preferredLocale: string;
  preferredTheme: string;
  createdAt: string;
  _count: { screenplays: number; collaborations: number; notifications: number };
};

export type AnalyticsData = {
  storyGrid: StoryGridRow[];
  storyArc: StoryArcPoint[];
  characterArcs: Array<{
    character: CharacterSummary;
    arcs: Array<{
      sceneId: string;
      sceneNumber: number;
      externalScore: number;
      internalScore: number;
      synopsis: string | null;
    }>;
  }>;
  episodeAverages: Array<{
    character: CharacterSummary;
    averages: Array<{
      episodeId: string;
      episodeOrder: number;
      episodeTitle: string;
      external: number | null;
      internal: number | null;
      sceneCount: number;
    }>;
  }> | null;
};

export type StoryGridRow = {
  sceneId: string;
  sceneNumber: number;
  storyEvent: string | null;
  valueShift: string | null;
  polarityShift: string | null;
  turnOn: string | null;
  turningPoint: boolean;
  storyValueScore: number | null;
  onStageCharacters: Array<{ id: string; name: string }>;
};

export type StoryArcPoint = {
  sceneId: string;
  sceneNumber: number;
  storyValueScore: number;
  synopsis: string | null;
};
