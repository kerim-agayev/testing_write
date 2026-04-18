-- AlterTable
ALTER TABLE "Screenplay" ADD COLUMN     "authorEmail" TEXT,
ADD COLUMN     "authorPhone" TEXT,
ADD COLUMN     "synopsis" TEXT,
ADD COLUMN     "writtenDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "screenplayId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "order" INTEGER NOT NULL DEFAULT 0,
    "sceneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_sceneId_key" ON "Card"("sceneId");

-- CreateIndex
CREATE INDEX "Card_screenplayId_idx" ON "Card"("screenplayId");

-- CreateIndex
CREATE INDEX "Card_order_idx" ON "Card"("order");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_screenplayId_fkey" FOREIGN KEY ("screenplayId") REFERENCES "Screenplay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE SET NULL ON UPDATE CASCADE;
