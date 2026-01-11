import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ensurePostPublication } from "@/lib/ensurePostPublication";

const prisma = new PrismaClient();

const DEFAULT_LIMIT = 18;
const MAX_LIMIT = 50;

export async function GET(req: NextRequest) {
  const hasPublishedColumn = await ensurePostPublication(prisma);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? session.user.id : null;

  const { searchParams } = new URL(req.url);
  const cursorParam = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");

  const cursor = cursorParam ? parseInt(cursorParam, 10) : null;
  const limit = Math.min(
    Math.max(1, limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT),
    MAX_LIMIT
  );

  const posts = await prisma.post.findMany({
    where: {
      ...(hasPublishedColumn ? { published: true } : {}),
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { id: "desc" },
    take: limit + 1,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          role: true,
          ...(userId && {
            followers: {
              where: { followerId: userId },
              select: { id: true },
            },
          }),
        },
      },
      media: {
        orderBy: { order: "asc" },
        select: {
          url: true,
          width: true,
          height: true,
        },
      },
      ...(userId
        ? {
            likes: {
              where: { userId },
              select: { id: true },
            },
            pins: {
              where: { userId },
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
    },
  });

  const hasMore = posts.length > limit;
  const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

  const postsWithFlags = postsToReturn.map(({ likes, pins, author, media, ...rest }) => ({
    ...rest,
    author: {
      id: author?.id,
      username: author?.username,
      pictureUrl: author?.pictureUrl,
      role: author?.role,
    },
    media: media.length > 0 ? media : undefined,
    likedByMe: userId ? likes.length > 0 : false,
    pinnedByMe: userId ? pins.length > 0 : false,
    isFollowed:
      userId && author?.followers ? author.followers.length > 0 : false,
  }));

  const nextCursor = hasMore && postsWithFlags.length > 0
    ? postsWithFlags[postsWithFlags.length - 1].id
    : null;

  return NextResponse.json({
    posts: postsWithFlags,
    nextCursor,
    hasMore,
  });
}
