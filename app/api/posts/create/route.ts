import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const extractHashtags = (content: string) => {
  const matches = content.match(/#[A-Za-z0-9_]+/g) ?? [];
  const normalized = matches
    .map((tag) => tag.replace(/^#/, "").toLowerCase())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(normalized));
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const files = formData.getAll("images") as File[];
  const text = formData.get("text") as string;
  const authorId = formData.get("authorId") as string;

  if (!files || files.length === 0 || !text || !authorId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Validate maximum number of images (10 max)
  if (files.length > 10) {
    return NextResponse.json(
      { error: "Maximum 10 images allowed per post" },
      { status: 400 }
    );
  }

  // Validate file sizes (30MB limit per file)
  const maxSize = 30 * 1024 * 1024; // 30MB

  // Allowed image formats that browsers can display
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif'
  ];

  for (const file of files) {
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds 30MB limit` },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `File "${file.name}" has unsupported format. Please use JPEG, PNG, GIF, WebP, SVG, or AVIF.` },
        { status: 400 }
      );
    }
  }

  const uploadPromises = files.map(async (file) => {
    const extension = file.name.split(".").pop();
    const uniqueName = `${crypto.randomUUID()}.${extension}`;
    const blob = await put(uniqueName, file, {
      access: "public",
      contentType: file.type, // Set proper content type so browser displays instead of downloads
      addRandomSuffix: false, // Don't add random suffix since we already have UUID
    });
    return blob.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  const hashtags = extractHashtags(text);

  const post = await prisma.post.create({
    data: {
      text,
      imageUrls,
      authorId: parseInt(authorId),
    },
  });

  if (hashtags.length > 0) {
    await prisma.$transaction(async (tx) => {
      await tx.hashtag.createMany({
        data: hashtags.map((name) => ({ name })),
        skipDuplicates: true,
      });

      const hashtagRecords = await tx.hashtag.findMany({
        where: { name: { in: hashtags } },
        select: { id: true },
      });

      await tx.postHashtag.createMany({
        data: hashtagRecords.map((hashtag) => ({
          postId: post.id,
          hashtagId: hashtag.id,
        })),
        skipDuplicates: true,
      });
    });
  }

  return NextResponse.json({ success: true, post });
}
