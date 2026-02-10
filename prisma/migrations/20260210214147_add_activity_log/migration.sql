-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('IMPORT_RUN', 'ENTRY_CREATED', 'ENTRY_UPDATED', 'ENTRY_DELETED');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "ActivityAction" NOT NULL,
    "entryId" TEXT,
    "changes" JSONB,
    "message" TEXT,
    "source" TEXT,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entryId_idx" ON "ActivityLog"("entryId");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
