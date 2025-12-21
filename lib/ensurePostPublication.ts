import type { PrismaClient } from "@prisma/client";

let hasPublishedColumnPromise: Promise<boolean> | null = null;

async function checkColumnExists(prisma: PrismaClient) {
  const result = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Post' AND column_name = 'published'
    `
  );

  return result.length > 0;
}

async function setupPublishedColumn(prisma: PrismaClient) {
  const exists = await checkColumnExists(prisma);
  if (exists) {
    return true;
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Post"
      ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT true
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "Post"
      SET "published" = true
      WHERE "published" IS NULL
    `);

    return true;
  } catch {
    // Database user might not have permissions to alter tables (e.g., hosted envs)
    // In that case, treat the column as unavailable so the app can still function.
    return false;
  }
}

export async function ensurePostPublication(prisma: PrismaClient) {
  if (!hasPublishedColumnPromise) {
    hasPublishedColumnPromise = setupPublishedColumn(prisma);
  }

  return hasPublishedColumnPromise;
}
