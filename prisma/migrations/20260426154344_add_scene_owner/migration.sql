-- CreateTable
CREATE TABLE "SceneOwner" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneOwner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SceneOwner_sceneId_key" ON "SceneOwner"("sceneId");

-- CreateIndex
CREATE INDEX "SceneOwner_sceneId_idx" ON "SceneOwner"("sceneId");

-- AddForeignKey
ALTER TABLE "SceneOwner" ADD CONSTRAINT "SceneOwner_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneOwner" ADD CONSTRAINT "SceneOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
