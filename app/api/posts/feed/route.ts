import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();
const FETCH_MULTIPLIER = 2;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? session.user.id : null;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 5, 1), 20);
  const cursorParam = searchParams.get("cursor");
  const cursor = cursorParam ? Number(cursorParam) : null;

  if (!userId) {
    return NextResponse.json({ posts: [], nextCursor: null, hasMore: false });
  }

  const posts = await prisma.post.findMany({
    where: {
      author: {
        followers: {
          some: { followerId: userId },
        },
      },
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { id: "desc" },
    take: limit * FETCH_MULTIPLIER,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          role: true,
          followers: {
            where: { followerId: userId },
            select: { id: true },
          },
        },
      },
      likes: {
        where: { userId },
        select: { id: true },
      },
      pins: {
        where: { userId },
        select: { id: true },
      },
      media: {
        orderBy: { order: "asc" },
        select: {
          url: true,
          width: true,
          height: true,
        },
      },
    },
  });

  const pins = await prisma.pin.findMany({
    where: {
      user: {
        followers: {
          some: { followerId: userId },
        },
      },
      ...(cursor ? { post: { id: { lt: cursor } } } : {}),
    },
    orderBy: {
      post: { id: "desc" },
    },
    take: limit * FETCH_MULTIPLIER,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          role: true,
          followers: {
            where: { followerId: userId },
            select: { id: true },
          },
        },
      },
      post: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              pictureUrl: true,
              role: true,
            },
          },
          likes: {
            where: { userId },
            select: { id: true },
          },
          pins: {
            where: { userId },
            select: { id: true },
          },
          media: {
            orderBy: { order: "asc" },
            select: {
              url: true,
              width: true,
              height: true,
            },
          },
        },
      },
    },
  });

  const postsWithFlags = posts.map(({ likes, pins, author, media, ...rest }) => ({
    ...rest,
    author: {
      id: author?.id,
      username: author?.username,
      pictureUrl: author?.pictureUrl,
      role: author?.role,
    },
    media: media.length > 0 ? media : undefined,
    likedByMe: likes.length > 0,
    pinnedByMe: pins.length > 0,
    isFollowed: author?.followers ? author.followers.length > 0 : false,
    isPinned: false,
    pinnedBy: null as { id: number; username: string; pictureUrl: string } | null,
  }));

  const pinsWithFlags = pins
    .filter((pin) => pin.post)
    .map((pin) => ({
      ...pin.post,
      author: {
        id: pin.post.author?.id,
        username: pin.post.author?.username,
        pictureUrl: pin.post.author?.pictureUrl,
        role: pin.post.author?.role,
      },
      media: pin.post.media.length > 0 ? pin.post.media : undefined,
      likedByMe: pin.post.likes.length > 0,
      pinnedByMe: pin.post.pins.length > 0,
      isFollowed: pin.user?.followers ? pin.user.followers.length > 0 : false,
      isPinned: true,
      pinnedBy: {
        id: pin.user?.id ?? 0,
      username: pin.user?.username ?? "",
      pictureUrl: pin.user?.pictureUrl ?? "",
      role: pin.user?.role,
      },
    }));

  const combined = [...postsWithFlags, ...pinsWithFlags].sort(
    (a, b) => b.id - a.id
  );

  const seen = new Set<number>();
  const uniqueItems: typeof postsWithFlags = [];

  for (const item of combined) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    uniqueItems.push(item);
    if (uniqueItems.length === limit) {
      break;
    }
  }

  const nextCursorValue =
    uniqueItems.length === limit ? uniqueItems[uniqueItems.length - 1].id : null;

  return NextResponse.json({
    posts: uniqueItems,
    nextCursor: nextCursorValue,
    hasMore: Boolean(nextCursorValue),
  });
}
