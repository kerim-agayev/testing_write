import { z } from 'zod';

export const CreateSceneSchema = z.object({
  sequenceId: z.string().min(1),
  sceneNumber: z.number().int().min(1).optional(), // Auto-assign if not provided
  intExt: z.enum(['INT', 'EXT', 'INT_EXT']).optional(),
  locationId: z.string().optional().nullable(),
  timeOfDay: z.string().max(50).optional().nullable(),
});

export const UpdateSceneSchema = z.object({
  content: z.any().optional(),
  intExt: z.enum(['INT', 'EXT', 'INT_EXT']).optional(),
  locationId: z.string().optional().nullable(),
  timeOfDay: z.string().max(50).optional().nullable(),
  synopsis: z.string().max(500).optional().nullable(),
  storyEvent: z.string().max(500).optional().nullable(),
  valueShift: z.string().max(200).optional().nullable(),
  polarityShift: z
    .enum(['POS_TO_POS', 'POS_TO_NEG', 'NEG_TO_POS', 'NEG_TO_NEG', 'NEUTRAL'])
    .optional()
    .nullable(),
  turnOn: z.enum(['ACTION', 'REVELATION']).optional().nullable(),
  turningPoint: z.boolean().optional(),
  storyValueScore: z.number().int().min(0).max(100).optional().nullable(),
  characterArcs: z
    .array(
      z.object({
        characterId: z.string(),
        externalScore: z.number().int().min(0).max(100),
        internalScore: z.number().int().min(0).max(100),
      })
    )
    .optional(),
});

export const CreateLocationSchema = z.object({
  name: z.string().min(1).max(200),
  intExt: z.enum(['INT', 'EXT', 'INT_EXT']).optional(),
  description: z.string().max(500).optional().nullable(),
});
