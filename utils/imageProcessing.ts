import sharp from "sharp";

export type ImageVariant = {
  buffer: Buffer;
  width: number;
  height: number;
};

export type ProcessedImageVariants = {
  thumbnail: ImageVariant;
  small: ImageVariant;
  medium: ImageVariant;
  large: ImageVariant;
  original: ImageVariant;
  mimeType: string;
  originalContentType: string;
  originalWidth: number;
  originalHeight: number;
};

const VARIANTS = {
  thumbnail: { width: 320, height: 320, quality: 90, fit: 'cover' as const },
  small: { width: 400, height: 400, quality: 85, fit: 'inside' as const },
  medium: { width: 640, height: 640, quality: 85, fit: 'inside' as const },
  large: { width: 1080, height: 1080, quality: 85, fit: 'inside' as const },
};

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function shouldPreserveOriginal(mimeType: string): boolean {
  return (
    mimeType === "image/svg+xml" ||
    mimeType === "image/gif"
  );
}

function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };
  return mimeToExt[mimeType] || "jpg";
}

async function generateVariant(
  buffer: Buffer,
  width: number,
  height: number,
  quality: number,
  fit: 'cover' | 'inside'
): Promise<ImageVariant> {
  const processed = await sharp(buffer)
    .resize(width, height, {
      fit,
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  const metadata = await sharp(processed).metadata();

  return {
    buffer: processed,
    width: metadata.width || width,
    height: metadata.height || height,
  };
}

export async function processImage(file: File): Promise<ProcessedImageVariants> {
  try {
    const buffer = await fileToBuffer(file);
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Unable to extract image dimensions");
    }

    if (shouldPreserveOriginal(file.type)) {
      const singleBuffer = buffer;
      return {
        thumbnail: { buffer: singleBuffer, width: metadata.width, height: metadata.height },
        small: { buffer: singleBuffer, width: metadata.width, height: metadata.height },
        medium: { buffer: singleBuffer, width: metadata.width, height: metadata.height },
        large: { buffer: singleBuffer, width: metadata.width, height: metadata.height },
        original: { buffer: singleBuffer, width: metadata.width, height: metadata.height },
        mimeType: file.type,
        originalContentType: file.type,
        originalWidth: metadata.width,
        originalHeight: metadata.height,
      };
    }

    const [thumbnail, small, medium, large] = await Promise.all([
      generateVariant(buffer, VARIANTS.thumbnail.width, VARIANTS.thumbnail.height, VARIANTS.thumbnail.quality, VARIANTS.thumbnail.fit),
      generateVariant(buffer, VARIANTS.small.width, VARIANTS.small.height, VARIANTS.small.quality, VARIANTS.small.fit),
      generateVariant(buffer, VARIANTS.medium.width, VARIANTS.medium.height, VARIANTS.medium.quality, VARIANTS.medium.fit),
      generateVariant(buffer, VARIANTS.large.width, VARIANTS.large.height, VARIANTS.large.quality, VARIANTS.large.fit),
    ]);

    return {
      thumbnail,
      small,
      medium,
      large,
      original: { buffer, width: metadata.width, height: metadata.height },
      mimeType: "image/webp",
      originalContentType: file.type,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
    };
  } catch (error) {
    console.error("Image processing failed:", error);
    throw error;
  }
}
