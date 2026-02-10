-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "ImportRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filename" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "uniqueKeys" INTEGER NOT NULL,
    "duplicates" INTEGER NOT NULL,
    "createdCount" INTEGER NOT NULL,
    "updatedCount" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "status" "ImportStatus" NOT NULL,
    "error" TEXT,

    CONSTRAINT "ImportRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportRun_createdAt_idx" ON "ImportRun"("createdAt");
