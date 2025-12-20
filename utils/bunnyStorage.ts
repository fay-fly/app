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

function getStorageUrl(filename: string): string {
  const baseUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE_NAME}`;
  return `${baseUrl}/${filename}`;
}

export async function uploadToBunny(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const url = getStorageUrl(filename);

  await axios.put(url, buffer, {
    headers: {
      'AccessKey': STORAGE_API_KEY,
      'Content-Type': contentType,
    },
  });

  if (process.env.BUNNY_CDN_HOSTNAME) {
    return `https://${process.env.BUNNY_CDN_HOSTNAME}/${filename}`;
  }

  return `https://${STORAGE_ZONE_NAME}.${STORAGE_REGION}.storage.bunnycdn.com/${filename}`;
}

export async function deleteFromBunny(filename: string): Promise<void> {
  const url = getStorageUrl(filename);

  await axios.delete(url, {
    headers: {
      'AccessKey': STORAGE_API_KEY,
    },
  });
}
