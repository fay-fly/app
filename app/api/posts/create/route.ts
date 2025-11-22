import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  const post = await prisma.post.create({
    data: {
      text,
      imageUrls,
      authorId: parseInt(authorId),
    },
  });

  return NextResponse.json({ success: true, post });
}
