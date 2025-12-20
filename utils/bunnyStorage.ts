import axios from 'axios';

if (!process.env.BUNNY_STORAGE_API_KEY) {
  throw new Error('BUNNY_STORAGE_API_KEY is not defined in environment variables');
}

if (!process.env.BUNNY_STORAGE_ZONE_NAME) {
  throw new Error('BUNNY_STORAGE_ZONE_NAME is not defined in environment variables');
}

const STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME;
const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY;
const STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || 'de';

function getStorageUrl(filepath: string): string {
  const baseUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE_NAME}`;
  return `${baseUrl}/${filepath}`;
}

export async function uploadToBunny(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder?: string
): Promise<string> {
  const filepath = folder ? `${folder}/${filename}` : filename;
  const url = getStorageUrl(filepath);

  await axios.put(url, buffer, {
    headers: {
      'AccessKey': STORAGE_API_KEY,
      'Content-Type': contentType,
    },
  });

  if (process.env.BUNNY_CDN_HOSTNAME) {
    return `https://${process.env.BUNNY_CDN_HOSTNAME}/${filepath}`;
  }

  return `https://${STORAGE_ZONE_NAME}.${STORAGE_REGION}.storage.bunnycdn.com/${filepath}`;
}

export async function deleteFromBunny(filename: string): Promise<void> {
  const url = getStorageUrl(filename);

  await axios.delete(url, {
    headers: {
      'AccessKey': STORAGE_API_KEY,
    },
  });
}

export type ImageVariantUrls = {
  thumbnailUrl: string;
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  originalUrl: string;
};

export async function uploadImageVariants(
  baseFilename: string,
  variants: {
    thumbnail: Buffer;
    small: Buffer;
    medium: Buffer;
    large: Buffer;
    original: Buffer;
  },
  contentType: string,
  originalContentType: string,
  folder?: string
): Promise<ImageVariantUrls> {
  const ext = contentType === 'image/webp' ? 'webp' : 'jpg';
  const base = baseFilename.replace(/\.[^/.]+$/, '');
  const filename = `${base}.${ext}`;

  // For original, preserve the original file extension
  const originalExt = originalContentType.split('/')[1] || 'jpg';
  const originalFilename = `${base}.${originalExt}`;

  // For posts, organize by size in subfolders
  // For other folders (profiles, backgrounds), keep flat structure
  const isPostsFolder = folder === 'posts';

  const [thumbnailUrl, smallUrl, mediumUrl, largeUrl, originalUrl] = await Promise.all([
    uploadToBunny(
      variants.thumbnail,
      filename,
      contentType,
      isPostsFolder ? 'posts/thumbnail' : folder
    ),
    uploadToBunny(
      variants.small,
      filename,
      contentType,
      isPostsFolder ? 'posts/small' : folder
    ),
    uploadToBunny(
      variants.medium,
      filename,
      contentType,
      isPostsFolder ? 'posts/medium' : folder
    ),
    uploadToBunny(
      variants.large,
      filename,
      contentType,
      isPostsFolder ? 'posts/large' : folder
    ),
    uploadToBunny(
      variants.original,
      originalFilename,
      originalContentType,
      isPostsFolder ? 'posts/original' : folder
    ),
  ]);

  return {
    thumbnailUrl,
    smallUrl,
    mediumUrl,
    largeUrl,
    originalUrl,
  };
}
