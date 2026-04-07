-- CreateEnum
CREATE TYPE "StructureType" AS ENUM ('THREE_ACT', 'SAVE_THE_CAT', 'DAN_HARMON', 'VOGLER', 'JOHN_TRUBY', 'EIGHT_SEQUENCE');

-- CreateTable
CREATE TABLE "ScreenplayStructure" (
    "id" TEXT NOT NULL,
    "screenplayId" TEXT NOT NULL,
    "structureType" "StructureType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScreenplayStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureAssignment" (
    "id" TEXT NOT NULL,
    "screenplayStructureId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "structureStageId" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StructureAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScreenplayStructure_screenplayId_idx" ON "ScreenplayStructure"("screenplayId");

-- CreateIndex
CREATE UNIQUE INDEX "ScreenplayStructure_screenplayId_structureType_key" ON "ScreenplayStructure"("screenplayId", "structureType");

-- CreateIndex
CREATE INDEX "StructureAssignment_screenplayStructureId_idx" ON "StructureAssignment"("screenplayStructureId");

-- CreateIndex
CREATE INDEX "StructureAssignment_sceneId_idx" ON "StructureAssignment"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureAssignment_screenplayStructureId_sceneId_structure_key" ON "StructureAssignment"("screenplayStructureId", "sceneId", "structureStageId");

-- AddForeignKey
ALTER TABLE "ScreenplayStructure" ADD CONSTRAINT "ScreenplayStructure_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureAssignment" ADD CONSTRAINT "StructureAssignment_screenplayStructureId_fkey" FOREIGN KEY ("screenplayStructureId") REFERENCES "ScreenplayStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureAssignment" ADD CONSTRAINT "StructureAssignment_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
