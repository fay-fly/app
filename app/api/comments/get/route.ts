import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId: Number(postId) },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          role: true,
        },
      },
    },
  });

  if (!comments) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(comments);
}
