ALTER TABLE "Post"
ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Post" SET "published" = true WHERE "published" IS NULL;
