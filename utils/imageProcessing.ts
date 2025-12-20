import sharp from "sharp";

export type ProcessedImage = {
  buffer: Buffer;
  dimensions: {
    width: number;
    height: number;
  };
  mimeType: string;
};

const MAX_WIDTH = 1200;
const QUALITY = 85;

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

export async function processImage(file: File): Promise<ProcessedImage> {
  try {
    const buffer = await fileToBuffer(file);

    if (shouldPreserveOriginal(file.type)) {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      return {
        buffer,
        dimensions: {
          width: metadata.width || 800,
          height: metadata.height || 600,
        },
        mimeType: file.type,
      };
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Unable to extract image dimensions");
    }

    let processedImage = image;

    if (metadata.width > MAX_WIDTH) {
      processedImage = processedImage.resize(MAX_WIDTH, null, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const processedBuffer = await processedImage
      .webp({ quality: QUALITY })
      .toBuffer();

    const finalMetadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      dimensions: {
        width: finalMetadata.width || metadata.width,
        height: finalMetadata.height || metadata.height,
      },
      mimeType: "image/webp",
    };
  } catch (error) {
    console.error("Image processing failed, using original:", error);

    const buffer = await fileToBuffer(file);
    const fallbackImage = sharp(buffer);
    const fallbackMetadata = await fallbackImage.metadata().catch(() => ({
      width: 800,
      height: 600,
    }));

    return {
      buffer,
      dimensions: {
        width: fallbackMetadata.width || 800,
        height: fallbackMetadata.height || 600,
      },
      mimeType: file.type,
    };
  }
}
