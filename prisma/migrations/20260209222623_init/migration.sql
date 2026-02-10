-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('MANHWA', 'MANHUA', 'LIGHT_NOVEL', 'WESTERN');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('CURRENT', 'COMPLETED');

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleLower" TEXT NOT NULL DEFAULT '',
    "baseTitle" TEXT NOT NULL DEFAULT '',
    "baseTitleLower" TEXT NOT NULL DEFAULT '',
    "descriptor" TEXT,
    "descriptorLower" TEXT NOT NULL DEFAULT '',
    "type" "EntryType" NOT NULL,
    "status" "EntryStatus",
    "chaptersRead" INTEGER,
    "totalChapters" INTEGER,
    "score" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AltTitle" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleLower" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AltTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entry_titleLower_idx" ON "Entry"("titleLower");

-- CreateIndex
CREATE INDEX "Entry_baseTitleLower_idx" ON "Entry"("baseTitleLower");

-- CreateIndex
CREATE INDEX "Entry_title_idx" ON "Entry"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_title_type_key" ON "Entry"("title", "type");

-- CreateIndex
CREATE INDEX "AltTitle_titleLower_idx" ON "AltTitle"("titleLower");

-- CreateIndex
CREATE UNIQUE INDEX "AltTitle_entryId_titleLower_key" ON "AltTitle"("entryId", "titleLower");

-- AddForeignKey
ALTER TABLE "AltTitle" ADD CONSTRAINT "AltTitle_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
