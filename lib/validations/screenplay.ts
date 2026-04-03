import { z } from 'zod';

export const CreateScreenplaySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['FILM', 'SERIES']),
  genre: z.array(z.string()).min(1, 'Select at least one genre').max(5),
  logline: z.string().max(500).optional().nullable(),
  // Optional structure setup
  acts: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        order: z.number().int().min(1),
        structures: z
          .array(
            z.object({
              title: z.string().min(1).max(100),
              order: z.number().int().min(1),
              sequences: z
                .array(
                  z.object({
                    title: z.string().min(1).max(100),
                    order: z.number().int().min(1),
                  })
                )
                .optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  // For TV series
  episodes: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        order: z.number().int().min(1),
        synopsis: z.string().max(1000).optional().nullable(),
      })
    )
    .optional(),
  // Characters to seed
  characters: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        roleType: z.enum(['PROTAGONIST', 'ANTAGONIST', 'SUPPORTING', 'MINOR']),
        isMajor: z.boolean(),
      })
    )
    .optional(),
});

export const UpdateScreenplaySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  genre: z.array(z.string()).max(5).optional(),
  logline: z.string().max(500).optional().nullable(),
  isDemo: z.boolean().optional(), // Admin only
});
