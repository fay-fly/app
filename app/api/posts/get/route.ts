import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!id) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          role: true,
          ...(userId
            ? {
                followers: {
                  where: { followerId: userId },
                  select: { id: true },
                },
              }
            : {}),
        },
      },
      ...(userId
        ? {
            likes: {
              where: { userId: userId },
              select: { id: true },
            },
            pins: {
              where: { userId: userId },
              select: { id: true },
            },
          }
        : {
            likes: {
              select: { id: true, userId: true },
            },
            pins: {
              select: { id: true, userId: true },
            },
          }),
      _count: {
        select: {
          likes: true,
          pins: true,
          comments: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const likedByMe = Boolean(post.likes && post.likes.length > 0);
  const pinnedByMe = Boolean(post.pins && post.pins.length > 0);
  const isFollowed = Boolean(
    post.author?.followers && post.author.followers.length > 0
  );

  const response = {
    ...post,
    likedByMe,
    pinnedByMe,
    isFollowed,
    likesCount: post._count.likes,
    pinsCount: post._count.pins,
    commentsCount: post._count.comments,
  };

  return NextResponse.json(response);
}
