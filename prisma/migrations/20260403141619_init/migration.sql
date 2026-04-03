-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MENTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ScreenplayType" AS ENUM ('FILM', 'SERIES');

-- CreateEnum
CREATE TYPE "IntExt" AS ENUM ('INT', 'EXT', 'INT_EXT');

-- CreateEnum
CREATE TYPE "PolarityShift" AS ENUM ('POS_TO_POS', 'POS_TO_NEG', 'NEG_TO_POS', 'NEG_TO_NEG', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "TurnOn" AS ENUM ('ACTION', 'REVELATION');

-- CreateEnum
CREATE TYPE "CharacterRole" AS ENUM ('PROTAGONIST', 'ANTAGONIST', 'SUPPORTING', 'MINOR');

-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('CO_WRITER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MentorAssignmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('NOTE', 'FLAG', 'MESSAGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "preferredLocale" TEXT NOT NULL DEFAULT 'az',
    "preferredTheme" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screenplay" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ScreenplayType" NOT NULL,
    "genre" TEXT[],
    "logline" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastEditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Screenplay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "screenplayId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "synopsis" TEXT,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Act" (
    "id" TEXT NOT NULL,
    "screenplayId" TEXT NOT NULL,
    "episodeId" TEXT,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Act_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Structure" (
    "id" TEXT NOT NULL,
    "actId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "sceneNumber" INTEGER NOT NULL,
    "intExt" "IntExt" NOT NULL DEFAULT 'INT',
    "locationId" TEXT,
    "timeOfDay" TEXT,
    "content" JSONB NOT NULL DEFAULT '{}',
    "synopsis" TEXT,
    "storyEvent" TEXT,
    "valueShift" TEXT,
    "polarityShift" "PolarityShift",
    "turnOn" "TurnOn",
    "turningPoint" BOOLEAN NOT NULL DEFAULT false,
    "storyValueScore" SMALLINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "screenplayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intExt" "IntExt" NOT NULL DEFAULT 'INT',
    "description" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "screenplayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleType" "CharacterRole" NOT NULL DEFAULT 'SUPPORTING',
    "isMajor" BOOLEAN NOT NULL DEFAULT false,
    "age" INTEGER,
    "height" TEXT,
    "weight" TEXT,
    "traits" TEXT[],
    "personality" TEXT,
    "biography" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneCharacter" (
    "sceneId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "SceneCharacter_pkey" PRIMARY KEY ("sceneId","characterId")
);

-- CreateTable
CREATE TABLE "CharacterArc" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "externalScore" SMALLINT NOT NULL,
    "internalScore" SMALLINT NOT NULL,

    CONSTRAINT "CharacterArc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreenplayCollaborator" (
    "screenplayId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'CO_WRITER',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "ScreenplayCollaborator_pkey" PRIMARY KEY ("screenplayId","userId")
);

-- CreateTable
CREATE TABLE "MentorAssignment" (
    "id" TEXT NOT NULL,
    "screenplayId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "status" "MentorAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "MentorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorNote" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'NOTE',
    "flagReason" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Screenplay_ownerId_idx" ON "Screenplay"("ownerId");

-- CreateIndex
CREATE INDEX "Screenplay_isDemo_idx" ON "Screenplay"("isDemo");

-- CreateIndex
CREATE INDEX "Screenplay_updatedAt_idx" ON "Screenplay"("updatedAt");

-- CreateIndex
CREATE INDEX "Episode_screenplayId_idx" ON "Episode"("screenplayId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_screenplayId_order_key" ON "Episode"("screenplayId", "order");

-- CreateIndex
CREATE INDEX "Act_screenplayId_idx" ON "Act"("screenplayId");

-- CreateIndex
CREATE INDEX "Act_episodeId_idx" ON "Act"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Act_screenplayId_episodeId_order_key" ON "Act"("screenplayId", "episodeId", "order");

-- CreateIndex
CREATE INDEX "Structure_actId_idx" ON "Structure"("actId");

-- CreateIndex
CREATE UNIQUE INDEX "Structure_actId_order_key" ON "Structure"("actId", "order");

-- CreateIndex
CREATE INDEX "Sequence_structureId_idx" ON "Sequence"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_structureId_order_key" ON "Sequence"("structureId", "order");

-- CreateIndex
CREATE INDEX "Scene_sequenceId_idx" ON "Scene"("sequenceId");

-- CreateIndex
CREATE INDEX "Scene_sceneNumber_idx" ON "Scene"("sceneNumber");

-- CreateIndex
CREATE INDEX "Scene_turningPoint_idx" ON "Scene"("turningPoint");

-- CreateIndex
CREATE INDEX "Location_screenplayId_idx" ON "Location"("screenplayId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_screenplayId_name_key" ON "Location"("screenplayId", "name");

-- CreateIndex
CREATE INDEX "Character_screenplayId_idx" ON "Character"("screenplayId");

-- CreateIndex
CREATE INDEX "Character_isMajor_idx" ON "Character"("isMajor");

-- CreateIndex
CREATE UNIQUE INDEX "Character_screenplayId_name_key" ON "Character"("screenplayId", "name");

-- CreateIndex
CREATE INDEX "SceneCharacter_characterId_idx" ON "SceneCharacter"("characterId");

-- CreateIndex
CREATE INDEX "CharacterArc_characterId_idx" ON "CharacterArc"("characterId");

-- CreateIndex
CREATE INDEX "CharacterArc_sceneId_idx" ON "CharacterArc"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterArc_characterId_sceneId_key" ON "CharacterArc"("characterId", "sceneId");

-- CreateIndex
CREATE INDEX "ScreenplayCollaborator_userId_idx" ON "ScreenplayCollaborator"("userId");

-- CreateIndex
CREATE INDEX "MentorAssignment_mentorId_idx" ON "MentorAssignment"("mentorId");

-- CreateIndex
CREATE INDEX "MentorAssignment_status_idx" ON "MentorAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MentorAssignment_screenplayId_mentorId_key" ON "MentorAssignment"("screenplayId", "mentorId");

-- CreateIndex
CREATE INDEX "MentorNote_sceneId_idx" ON "MentorNote"("sceneId");

-- CreateIndex
CREATE INDEX "MentorNote_mentorId_idx" ON "MentorNote"("mentorId");

-- CreateIndex
CREATE INDEX "MentorNote_isRead_idx" ON "MentorNote"("isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "Screenplay" ADD CONSTRAINT "Screenplay_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Act" ADD CONSTRAINT "Act_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Act" ADD CONSTRAINT "Act_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Structure" ADD CONSTRAINT "Structure_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Act"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sequence" ADD CONSTRAINT "Sequence_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneCharacter" ADD CONSTRAINT "SceneCharacter_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneCharacter" ADD CONSTRAINT "SceneCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterArc" ADD CONSTRAINT "CharacterArc_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterArc" ADD CONSTRAINT "CharacterArc_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenplayCollaborator" ADD CONSTRAINT "ScreenplayCollaborator_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreenplayCollaborator" ADD CONSTRAINT "ScreenplayCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorAssignment" ADD CONSTRAINT "MentorAssignment_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorAssignment" ADD CONSTRAINT "MentorAssignment_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorNote" ADD CONSTRAINT "MentorNote_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorNote" ADD CONSTRAINT "MentorNote_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
