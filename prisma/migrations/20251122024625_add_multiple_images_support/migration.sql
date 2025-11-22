-- AlterTable
-- Add the new imageUrls array column
ALTER TABLE "Post" ADD COLUMN "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing imageUrl data to imageUrls array
UPDATE "Post" SET "imageUrls" = ARRAY["imageUrl"] WHERE "imageUrl" IS NOT NULL;

-- Drop the old imageUrl column
ALTER TABLE "Post" DROP COLUMN "imageUrl";