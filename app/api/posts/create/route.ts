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

  const uploadPromises = files.map(async (file) => {
    const extension = file.name.split(".").pop();
    const uniqueName = `${crypto.randomUUID()}.${extension}`;
    const blob = await put(uniqueName, file, {
      access: "public",
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
