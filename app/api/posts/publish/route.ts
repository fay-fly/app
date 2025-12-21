import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ensurePostPublication } from "@/lib/ensurePostPublication";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const hasPublishedColumn = await ensurePostPublication(prisma);

  if (!hasPublishedColumn) {
    return NextResponse.json(
      { error: "Post publishing is unavailable. Please run the latest migrations." },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = (await req.json()) as { postId: number };

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, published: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "You don't have permission to publish this post" },
      { status: 403 }
    );
  }

  if (post.published) {
    return NextResponse.json({ error: "Post is already published" }, { status: 400 });
  }

  await prisma.post.update({
    where: { id: postId },
    data: { published: true },
  });

  return NextResponse.json({ success: true });
}
