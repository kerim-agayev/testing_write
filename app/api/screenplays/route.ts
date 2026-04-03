import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth-utils';
import { listScreenplays } from '@/lib/db/screenplays';
import { CreateScreenplaySchema } from '@/lib/validations/screenplay';
import { prisma } from '@/lib/prisma';

// GET /api/screenplays — list user's screenplays
export async function GET() {
  try {
    const user = await requireAuth();
    const screenplays = await listScreenplays(user.id);
    return NextResponse.json(screenplays);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/screenplays — create new screenplay
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = CreateScreenplaySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, type, genre, logline, acts, episodes, characters } = parsed.data;

    // Create screenplay with optional structure
    const screenplay = await prisma.$transaction(async (tx) => {
      const sp = await tx.screenplay.create({
        data: {
          ownerId: user.id,
          title,
          type,
          genre,
          logline,
        },
      });

      // Create episodes if series
      if (type === 'SERIES' && episodes?.length) {
        for (const ep of episodes) {
          await tx.episode.create({
            data: {
              screenplayId: sp.id,
              title: ep.title,
              order: ep.order,
              synopsis: ep.synopsis,
            },
          });
        }
      }

      // Create acts with optional structures/sequences
      if (acts?.length) {
        for (const act of acts) {
          const createdAct = await tx.act.create({
            data: {
              screenplayId: sp.id,
              title: act.title,
              order: act.order,
            },
          });

          if (act.structures?.length) {
            for (const structure of act.structures) {
              const createdStructure = await tx.structure.create({
                data: {
                  actId: createdAct.id,
                  title: structure.title,
                  order: structure.order,
                },
              });

              if (structure.sequences?.length) {
                for (const seq of structure.sequences) {
                  await tx.sequence.create({
                    data: {
                      structureId: createdStructure.id,
                      title: seq.title,
                      order: seq.order,
                    },
                  });
                }
              }
            }
          }
        }
      } else {
        // Create default 3-act structure
        const defaultActs = [
          { title: 'Act One', order: 1 },
          { title: 'Act Two', order: 2 },
          { title: 'Act Three', order: 3 },
        ];
        for (const act of defaultActs) {
          const createdAct = await tx.act.create({
            data: { screenplayId: sp.id, ...act },
          });
          const structure = await tx.structure.create({
            data: { actId: createdAct.id, title: 'Main', order: 1 },
          });
          await tx.sequence.create({
            data: { structureId: structure.id, title: 'Sequence 1', order: 1 },
          });
        }
      }

      // Create characters if provided
      if (characters?.length) {
        for (const char of characters) {
          await tx.character.create({
            data: {
              screenplayId: sp.id,
              name: char.name,
              roleType: char.roleType,
              isMajor: char.isMajor,
            },
          });
        }
      }

      return sp;
    });

    return NextResponse.json(screenplay, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
