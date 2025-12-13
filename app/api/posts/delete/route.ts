import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { canDeletePost } from "@/lib/permissions";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await req.json();

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const isOwnPost = post.authorId === session.user.id;

  if (!canDeletePost(session.user.role, isOwnPost)) {
    return NextResponse.json(
      { error: "You don't have permission to delete this post" },
      { status: 403 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { postId } }),
      prisma.comment.deleteMany({ where: { postId } }),
      prisma.like.deleteMany({ where: { postId } }),
      prisma.pin.deleteMany({ where: { postId } }),
      prisma.postHashtag.deleteMany({ where: { postId } }),
      prisma.post.delete({ where: { id: postId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
