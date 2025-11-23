-- DropForeignKey
ALTER TABLE "RecentSearch" DROP CONSTRAINT "RecentSearch_ownerId_fkey";

-- DropIndex
DROP INDEX "RecentSearch_ownerId_createdAt_idx";

-- AlterTable
ALTER TABLE "RecentSearch" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "RecentSearch_ownerId_createdAt_idx" ON "RecentSearch"("ownerId", "createdAt");

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
