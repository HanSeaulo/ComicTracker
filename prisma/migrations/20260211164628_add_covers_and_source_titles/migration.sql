-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "coverFetchedAt" TIMESTAMP(3),
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "coverSource" TEXT,
ADD COLUMN     "coverSourceId" INTEGER,
ADD COLUMN     "sourceTitlesAt" TIMESTAMP(3),
ADD COLUMN     "sourceTitlesJson" TEXT;
