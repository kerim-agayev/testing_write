import { prisma } from '@/lib/prisma';
import type { CharacterRole } from '@prisma/client';

export async function listCharacters(screenplayId: string) {
  return prisma.character.findMany({
    where: { screenplayId },
    select: {
      id: true,
      name: true,
      roleType: true,
      isMajor: true,
      age: true,
      traits: true,
      createdAt: true,
      _count: { select: { sceneCharacters: true } },
    },
    orderBy: [{ isMajor: 'desc' }, { createdAt: 'asc' }],
  });
}

export async function getCharacter(characterId: string) {
  return prisma.character.findUnique({
    where: { id: characterId },
    include: {
      arcs: {
        include: {
          scene: {
            select: { id: true, sceneNumber: true, synopsis: true },
          },
        },
        orderBy: { scene: { sceneNumber: 'asc' } },
      },
      sceneCharacters: {
        include: {
          scene: {
            select: { id: true, sceneNumber: true, synopsis: true },
          },
        },
      },
    },
  });
}

export async function createCharacter(
  screenplayId: string,
  data: {
    name: string;
    roleType?: CharacterRole;
    isMajor?: boolean;
    age?: number | null;
    height?: string | null;
    weight?: string | null;
    traits?: string[];
    personality?: string | null;
    biography?: string | null;
  }
) {
  return prisma.character.create({
    data: {
      screenplayId,
      name: data.name,
      roleType: data.roleType ?? 'SUPPORTING',
      isMajor: data.isMajor ?? false,
      age: data.age,
      height: data.height,
      weight: data.weight,
      traits: data.traits ?? [],
      personality: data.personality,
      biography: data.biography,
    },
  });
}

export async function updateCharacter(
  characterId: string,
  data: {
    name?: string;
    roleType?: CharacterRole;
    isMajor?: boolean;
    age?: number | null;
    height?: string | null;
    weight?: string | null;
    traits?: string[];
    personality?: string | null;
    biography?: string | null;
  }
) {
  return prisma.character.update({
    where: { id: characterId },
    data,
  });
}

export async function deleteCharacter(characterId: string) {
  return prisma.character.delete({ where: { id: characterId } });
}
