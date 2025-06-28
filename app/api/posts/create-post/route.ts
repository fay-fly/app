import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("image") as File;
  const text = formData.get("text") as string;
  const authorId = formData.get("authorId") as string;

  if (!file || !text || !authorId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: "public",
  });

  const post = await prisma.post.create({
    data: {
      text,
      imageUrl: blob.url,
      authorId: parseInt(authorId),
    },
  });

  return NextResponse.json({ success: true, post });
}
