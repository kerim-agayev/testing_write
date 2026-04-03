import { z } from 'zod';

export const CreateCharacterSchema = z.object({
  name: z.string().min(1, 'Character name is required').max(100),
  roleType: z.enum(['PROTAGONIST', 'ANTAGONIST', 'SUPPORTING', 'MINOR']).optional(),
  isMajor: z.boolean().optional(),
  age: z.number().int().min(0).max(200).optional().nullable(),
  height: z.string().max(50).optional().nullable(),
  weight: z.string().max(50).optional().nullable(),
  traits: z.array(z.string().max(50)).max(20).optional(),
  personality: z.string().max(2000).optional().nullable(),
  biography: z.string().max(10000).optional().nullable(),
});

export const UpdateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  roleType: z.enum(['PROTAGONIST', 'ANTAGONIST', 'SUPPORTING', 'MINOR']).optional(),
  isMajor: z.boolean().optional(),
  age: z.number().int().min(0).max(200).optional().nullable(),
  height: z.string().max(50).optional().nullable(),
  weight: z.string().max(50).optional().nullable(),
  traits: z.array(z.string().max(50)).max(20).optional(),
  personality: z.string().max(2000).optional().nullable(),
  biography: z.string().max(10000).optional().nullable(),
});
