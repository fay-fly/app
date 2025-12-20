import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import sharp from 'sharp';
import { uploadImageVariants } from '../utils/bunnyStorage';

const prisma = new PrismaClient();

const VARIANTS = {
  thumbnail: { width: 320, height: 320, quality: 90, fit: 'cover' as const },
  small: { width: 400, height: 400, quality: 85, fit: 'inside' as const },
  medium: { width: 640, height: 640, quality: 85, fit: 'inside' as const },
  large: { width: 1080, height: 1080, quality: 85, fit: 'inside' as const },
};

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

function extractFilename(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0];
}

async function generateVariant(
  buffer: Buffer,
  width: number,
  height: number,
  quality: number,
  fit: 'cover' | 'inside'
): Promise<Buffer> {
  return await sharp(buffer)
    .resize(width, height, {
      fit,
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();
}

async function regenerateVariantsForImage(mediaId: number, currentUrl: string): Promise<void> {
  try {
    console.log(`  Processing media ${mediaId}...`);

    // Download current image
    const originalBuffer = await downloadImage(currentUrl);

    // Generate all 4 variants in parallel
    const [thumbnail, small, medium, large] = await Promise.all([
      generateVariant(
        originalBuffer,
        VARIANTS.thumbnail.width,
        VARIANTS.thumbnail.height,
        VARIANTS.thumbnail.quality,
        VARIANTS.thumbnail.fit
      ),
      generateVariant(
        originalBuffer,
        VARIANTS.small.width,
        VARIANTS.small.height,
        VARIANTS.small.quality,
        VARIANTS.small.fit
      ),
      generateVariant(
        originalBuffer,
        VARIANTS.medium.width,
        VARIANTS.medium.height,
        VARIANTS.medium.quality,
        VARIANTS.medium.fit
      ),
      generateVariant(
        originalBuffer,
        VARIANTS.large.width,
        VARIANTS.large.height,
        VARIANTS.large.quality,
        VARIANTS.large.fit
      ),
    ]);

    // Upload all variants to Bunny.net with size-specific folders
    const filename = extractFilename(currentUrl);
    const urls = await uploadImageVariants(
      filename,
      { thumbnail, small, medium, large, original: originalBuffer },
      'image/webp',
      'image/webp',  // Original will also be webp for regenerated images
      'posts'  // Will automatically organize into posts/thumbnail, posts/small, etc.
    );

    // Update database
    await prisma.postMedia.update({
      where: { id: mediaId },
      data: {
        url: urls.largeUrl,
        thumbnailUrl: urls.thumbnailUrl,
        smallUrl: urls.smallUrl,
        mediumUrl: urls.mediumUrl,
        originalUrl: urls.originalUrl,
      },
    });

    console.log(`  ✓ Regenerated variants for media ${mediaId}`);
  } catch (error) {
    console.error(`  ✗ Failed to regenerate variants for media ${mediaId}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🎨 Starting image variant regeneration...\n');

  // Get all media that don't have variants yet
  const mediaWithoutVariants = await prisma.postMedia.findMany({
    where: {
      OR: [
        { thumbnailUrl: null },
        { smallUrl: null },
        { mediumUrl: null },
      ],
    },
    select: {
      id: true,
      url: true,
    },
  });

  console.log(`Found ${mediaWithoutVariants.length} images to process\n`);

  if (mediaWithoutVariants.length === 0) {
    console.log('✅ All images already have variants!');
    await prisma.$disconnect();
    return;
  }

  let processed = 0;
  let failed = 0;

  for (const media of mediaWithoutVariants) {
    try {
      await regenerateVariantsForImage(media.id, media.url);
      processed++;

      // Show progress every 5 images
      if (processed % 5 === 0) {
        console.log(`\n📊 Progress: ${processed}/${mediaWithoutVariants.length} images processed\n`);
      }
    } catch (error) {
      failed++;
      console.error(`Failed to process media ${media.id}, continuing...`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Image variant regeneration complete!');
  console.log(`✅ Successfully processed: ${processed}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});
