-- CreateEnum
CREATE TYPE "RecentSearchType" AS ENUM ('USER', 'HASHTAG');

-- CreateTable
CREATE TABLE "RecentSearch" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "searchedUserId" INTEGER,
    "hashtag" TEXT,
    "type" "RecentSearchType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentSearch_ownerId_createdAt_idx" ON "RecentSearch"("ownerId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_searchedUserId_fkey" FOREIGN KEY ("searchedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
