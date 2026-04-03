import { z } from 'zod';

export const CreateMentorNoteSchema = z.object({
  sceneId: z.string().min(1),
  content: z.string().min(1, 'Note content is required').max(5000),
  type: z.enum(['NOTE', 'FLAG', 'MESSAGE']),
  flagReason: z.string().max(100).optional().nullable(),
});

export const CreateMentorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const AssignMentorSchema = z.object({
  screenplayId: z.string().min(1),
  mentorId: z.string().min(1),
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED']).optional(),
});

export const UpsertArcSchema = z.object({
  characterId: z.string().min(1),
  sceneId: z.string().min(1),
  externalScore: z.number().int().min(0).max(100),
  internalScore: z.number().int().min(0).max(100),
});
