-- CreateTable
CREATE TABLE "SceneKronotop" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "kronotopId" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SceneKronotop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SceneKronotop_sceneId_idx" ON "SceneKronotop"("sceneId");

-- CreateIndex
CREATE INDEX "SceneKronotop_kronotopId_idx" ON "SceneKronotop"("kronotopId");

-- CreateIndex
CREATE UNIQUE INDEX "SceneKronotop_sceneId_kronotopId_key" ON "SceneKronotop"("sceneId", "kronotopId");

-- AddForeignKey
ALTER TABLE "SceneKronotop" ADD CONSTRAINT "SceneKronotop_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
