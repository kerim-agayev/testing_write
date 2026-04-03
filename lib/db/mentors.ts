import { prisma } from '@/lib/prisma';
import type { MentorAssignmentStatus, NoteType } from '@prisma/client';

export async function getMentorAssignments(mentorId: string) {
  return prisma.mentorAssignment.findMany({
    where: { mentorId, status: 'ACTIVE' },
    include: {
      screenplay: {
        select: {
          id: true,
          title: true,
          type: true,
          owner: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { requestedAt: 'desc' },
  });
}

export async function createMentorNote(data: {
  mentorId: string;
  sceneId: string;
  content: string;
  type: NoteType;
  flagReason?: string | null;
}) {
  const note = await prisma.mentorNote.create({ data });

  // Create notification for the screenplay owner
  const scene = await prisma.scene.findUnique({
    where: { id: data.sceneId },
    select: {
      sceneNumber: true,
      sequence: {
        select: {
          structure: {
            select: { act: { select: { screenplay: { select: { ownerId: true, id: true } } } } },
          },
        },
      },
    },
  });

  if (scene) {
    const ownerId = scene.sequence.structure.act.screenplay.ownerId;
    const screenplayId = scene.sequence.structure.act.screenplay.id;
    await prisma.notification.create({
      data: {
        userId: ownerId,
        type: data.type === 'FLAG' ? 'mentor_flag' : 'mentor_note',
        message: `Mentor added a ${data.type.toLowerCase()} on Scene ${scene.sceneNumber}`,
        linkUrl: `/screenplay/${screenplayId}/edit?scene=${data.sceneId}`,
      },
    });
  }

  return note;
}

export async function assignMentor(
  screenplayId: string,
  mentorId: string,
  status: MentorAssignmentStatus = 'PENDING'
) {
  return prisma.mentorAssignment.upsert({
    where: { screenplayId_mentorId: { screenplayId, mentorId } },
    update: { status },
    create: { screenplayId, mentorId, status },
  });
}

export async function updateAssignmentStatus(
  id: string,
  status: MentorAssignmentStatus
) {
  return prisma.mentorAssignment.update({
    where: { id },
    data: {
      status,
      ...(status === 'ACTIVE' ? { acceptedAt: new Date() } : {}),
    },
  });
}
