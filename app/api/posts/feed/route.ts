import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? session.user.id : null;

  if (!userId) {
    return NextResponse.json([]);
  }

  // Fetch posts from followed users
  const posts = await prisma.post.findMany({
    where: {
      author: {
        followers: {
          some: { followerId: userId },
        },
      },
    },
    orderBy: { id: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
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
    },
  });

  // Fetch pins from followed users
  const pins = await prisma.pin.findMany({
    where: {
      user: {
        followers: {
          some: { followerId: userId },
        },
      },
    },
    orderBy: { id: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
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
        },
      },
    },
  });

  const postsWithFlags = posts.map(({ likes, pins, author, ...rest }) => ({
    ...rest,
    author: {
      id: author?.id,
      username: author?.username,
      pictureUrl: author?.pictureUrl,
    },
    likedByMe: likes.length > 0,
    pinnedByMe: pins.length > 0,
    isFollowed: author?.followers ? author.followers.length > 0 : false,
    isPinned: false,
    pinnedBy: null as { id: number; username: string; pictureUrl: string } | null,
  }));

  const pinsWithFlags = pins.map((pin) => ({
    ...pin.post,
    author: {
      id: pin.post.author?.id,
      username: pin.post.author?.username,
      pictureUrl: pin.post.author?.pictureUrl,
    },
    likedByMe: pin.post.likes.length > 0,
    pinnedByMe: pin.post.pins.length > 0,
    isFollowed: pin.user?.followers ? pin.user.followers.length > 0 : false,
    isPinned: true,
    pinnedBy: {
      id: pin.user?.id,
      username: pin.user?.username,
      pictureUrl: pin.user?.pictureUrl,
    },
  }));

  // Combine and sort by id (newest first)
  const allItems = [...postsWithFlags, ...pinsWithFlags].sort(
    (a, b) => b.id - a.id
  );

  // Remove duplicates (keep the first occurrence - could be either post or pin)
  const seen = new Set<number>();
  const uniqueItems = allItems.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });

  return NextResponse.json(uniqueItems);
}
