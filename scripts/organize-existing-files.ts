import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY;
const STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || 'de';
const CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;

function getStorageUrl(filepath: string): string {
  const baseUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE_NAME}`;
  return `${baseUrl}/${filepath}`;
}

function getCdnUrl(filepath: string): string {
  if (CDN_HOSTNAME) {
    return `https://${CDN_HOSTNAME}/${filepath}`;
  }
  return `https://${STORAGE_ZONE_NAME}.${STORAGE_REGION}.storage.bunnycdn.com/${filepath}`;
}

function extractFilenameFromUrl(url: string): string {
  // Extract filename from URL (remove domain and query params)
  const parts = url.split('/');
  const filenameWithParams = parts[parts.length - 1];
  return filenameWithParams.split('?')[0];
}

function isInFolder(url: string): boolean {
  // Check if URL already contains the NEW size-specific folder structure
  // For posts: must be in posts/thumbnail, posts/small, posts/medium, or posts/large
  // For others: profiles/ or backgrounds/ folders
  return (
    url.includes('/posts/thumbnail/') ||
    url.includes('/posts/small/') ||
    url.includes('/posts/medium/') ||
    url.includes('/posts/large/') ||
    url.includes('/profiles/') ||
    url.includes('/backgrounds/')
  );
}

function getVariantSizeFolder(filename: string): string {
  // Determine which size folder based on filename suffix
  if (filename.includes('_thumb.')) return 'posts/thumbnail';
  if (filename.includes('_small.')) return 'posts/small';
  if (filename.includes('_medium.')) return 'posts/medium';
  if (filename.includes('_large.')) return 'posts/large';
  if (filename.includes('_original.')) return 'posts/original';

  // If no suffix, it's likely the large/main variant
  return 'posts/large';
}

function removeVariantSuffix(filename: string): string {
  // Remove _thumb, _small, _medium, _large suffixes from filename
  return filename
    .replace('_thumb.', '.')
    .replace('_small.', '.')
    .replace('_medium.', '.')
    .replace('_large.', '.');
}

async function downloadFile(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

async function uploadFile(buffer: Buffer, filepath: string, contentType: string): Promise<void> {
  const url = getStorageUrl(filepath);
  await axios.put(url, buffer, {
    headers: {
      'AccessKey': STORAGE_API_KEY,
      'Content-Type': contentType,
    },
  });
}

async function deleteFile(filepath: string): Promise<void> {
  const url = getStorageUrl(filepath);
  await axios.delete(url, {
    headers: {
      'AccessKey': STORAGE_API_KEY,
    },
  });
}

async function moveFile(oldUrl: string, newFolder: string, isPostMedia: boolean = false): Promise<string> {
  const filename = extractFilenameFromUrl(oldUrl);

  let targetFolder = newFolder;
  let targetFilename = filename;

  // For post media, use size-specific subfolders and remove suffixes
  if (isPostMedia && newFolder === 'posts') {
    targetFolder = getVariantSizeFolder(filename);
    targetFilename = removeVariantSuffix(filename);
  }

  const newFilepath = `${targetFolder}/${targetFilename}`;

  // Download from old location
  const buffer = await downloadFile(oldUrl);

  // Determine content type
  const ext = targetFilename.split('.').pop()?.toLowerCase();
  const contentType = ext === 'webp' ? 'image/webp' : `image/${ext}`;

  // Upload to new location
  await uploadFile(buffer, newFilepath, contentType);

  // Delete old file (only if it was in root, not from external source)
  const oldFilename = extractFilenameFromUrl(oldUrl);
  if (oldUrl.includes(STORAGE_ZONE_NAME!) && !isInFolder(oldUrl)) {
    try {
      await deleteFile(oldFilename);
    } catch (error) {
      console.warn(`  ⚠️  Could not delete old file ${oldFilename}, continuing...`);
    }
  }

  return getCdnUrl(newFilepath);
}

async function organizePostMedia() {
  console.log('🖼️  Organizing post media...\n');

  const media = await prisma.postMedia.findMany();
  const mediaToOrganize = media.filter(m => !isInFolder(m.url));

  console.log(`Found ${mediaToOrganize.length} post media items to organize\n`);

  if (mediaToOrganize.length === 0) {
    console.log('✅ All post media already organized!\n');
    return;
  }

  let organized = 0;
  let failed = 0;

  for (const item of mediaToOrganize) {
    try {
      console.log(`  Processing media ${item.id}...`);

      const updateData: any = {};

      // Move main URL
      if (item.url) {
        updateData.url = await moveFile(item.url, 'posts', true);
      }

      // Move thumbnail variant
      if (item.thumbnailUrl && !isInFolder(item.thumbnailUrl)) {
        updateData.thumbnailUrl = await moveFile(item.thumbnailUrl, 'posts', true);
      }

      // Move small variant
      if (item.smallUrl && !isInFolder(item.smallUrl)) {
        updateData.smallUrl = await moveFile(item.smallUrl, 'posts', true);
      }

      // Move medium variant
      if (item.mediumUrl && !isInFolder(item.mediumUrl)) {
        updateData.mediumUrl = await moveFile(item.mediumUrl, 'posts', true);
      }

      // Move original (if exists)
      if (item.originalUrl && !isInFolder(item.originalUrl)) {
        updateData.originalUrl = await moveFile(item.originalUrl, 'posts', true);
      }

      // Update database
      await prisma.postMedia.update({
        where: { id: item.id },
        data: updateData,
      });

      organized++;
      console.log(`  ✓ Organized media ${item.id}\n`);

      // Show progress every 5 items
      if (organized % 5 === 0) {
        console.log(`📊 Progress: ${organized}/${mediaToOrganize.length} items organized\n`);
      }
    } catch (error) {
      failed++;
      console.error(`  ✗ Failed to organize media ${item.id}:`, error);
      console.log('');
    }
  }

  console.log(`✅ Organized ${organized} post media items`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('');
}

async function organizeUserImages() {
  console.log('👤 Organizing user profile images...\n');

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { pictureUrl: { not: null } },
        { profileBgUrl: { not: null } },
      ],
    },
  });

  const usersToOrganize = users.filter(
    u => (u.pictureUrl && !isInFolder(u.pictureUrl)) || (u.profileBgUrl && !isInFolder(u.profileBgUrl))
  );

  console.log(`Found ${usersToOrganize.length} users with images to organize\n`);

  if (usersToOrganize.length === 0) {
    console.log('✅ All user images already organized!\n');
    return;
  }

  let organizedPictures = 0;
  let organizedBackgrounds = 0;
  let failed = 0;

  for (const user of usersToOrganize) {
    try {
      console.log(`  Processing user ${user.id} (${user.username})...`);

      const updateData: any = {};

      // Move profile picture
      if (user.pictureUrl && !isInFolder(user.pictureUrl)) {
        updateData.pictureUrl = await moveFile(user.pictureUrl, 'profiles');
        organizedPictures++;
      }

      // Move background image
      if (user.profileBgUrl && !isInFolder(user.profileBgUrl)) {
        updateData.profileBgUrl = await moveFile(user.profileBgUrl, 'backgrounds');
        organizedBackgrounds++;
      }

      // Update database
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      console.log(`  ✓ Organized user ${user.id}\n`);
    } catch (error) {
      failed++;
      console.error(`  ✗ Failed to organize user ${user.id}:`, error);
      console.log('');
    }
  }

  console.log(`✅ Organized ${organizedPictures} profile pictures`);
  console.log(`✅ Organized ${organizedBackgrounds} background images`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('');
}

async function main() {
  console.log('🚀 Starting file organization...\n');
  console.log('='.repeat(60));
  console.log('');

  await organizePostMedia();
  await organizeUserImages();

  console.log('='.repeat(60));
  console.log('🎉 File organization complete!');
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('💥 Organization failed:', error);
  process.exit(1);
});
