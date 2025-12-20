import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { uploadToBunny } from '../utils/bunnyStorage';

const prisma = new PrismaClient();

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

function extractFilename(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0];
}

async function migratePostMedia() {
  console.log('🖼️  Migrating post media...');
  const media = await prisma.postMedia.findMany();

  let migrated = 0;
  for (const item of media) {
    try {
      const buffer = await downloadImage(item.url);
      const filename = extractFilename(item.url);
      const contentType = `image/${filename.split('.').pop()}`;

      // Upload to posts/large folder (main variant)
      const newUrl = await uploadToBunny(buffer, filename, contentType, 'posts/large');

      await prisma.postMedia.update({
        where: { id: item.id },
        data: { url: newUrl },
      });

      migrated++;
      console.log(`  ✓ Migrated media ${item.id}: ${filename}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate media ${item.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${migrated}/${media.length} post media items\n`);
}

async function migrateUserImages() {
  console.log('👤 Migrating user profile images...');
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { pictureUrl: { not: null } },
        { profileBgUrl: { not: null } },
      ],
    },
  });

  let migratedPictures = 0;
  let migratedBackgrounds = 0;

  for (const user of users) {
    try {
      const updateData: any = {};

      if (user.pictureUrl) {
        const buffer = await downloadImage(user.pictureUrl);
        const filename = extractFilename(user.pictureUrl);
        const contentType = `image/${filename.split('.').pop()}`;
        updateData.pictureUrl = await uploadToBunny(buffer, filename, contentType, 'profiles');
        migratedPictures++;
      }

      if (user.profileBgUrl) {
        const buffer = await downloadImage(user.profileBgUrl);
        const filename = extractFilename(user.profileBgUrl);
        const contentType = `image/${filename.split('.').pop()}`;
        updateData.profileBgUrl = await uploadToBunny(buffer, filename, contentType, 'backgrounds');
        migratedBackgrounds++;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      console.log(`  ✓ Migrated user ${user.id} (${user.username})`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate user ${user.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${migratedPictures} profile pictures`);
  console.log(`✅ Migrated ${migratedBackgrounds} background images\n`);
}

async function main() {
  console.log('🚀 Starting migration from Vercel Blob to Bunny.net\n');

  await migratePostMedia();
  await migrateUserImages();

  console.log('🎉 Migration complete!');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});
