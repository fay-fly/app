import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ensurePostPublication } from "@/lib/ensurePostPublication";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const hasPublishedColumn = await ensurePostPublication(prisma);

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? session.user.id : null;

  const { searchParams } = new URL(req.url);
  const rawName = searchParams.get("name") ?? "";
  const normalized = rawName.replace(/^#/, "").trim().toLowerCase();

  if (!normalized) {
    return NextResponse.json(
      { error: "Hashtag name is required" },
      { status: 400 }
    );
  }

  const posts = await prisma.post.findMany({
    where: {
      ...(hasPublishedColumn ? { published: true } : {}),
      hashtags: {
        some: {
          hashtag: {
            name: normalized,
          },
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
          role: true,
          ...(userId && {
            followers: {
              where: { followerId: userId },
              select: { id: true },
            },
          }),
        },
      },
      hashtags: {
        select: {
          hashtag: {
            select: {
              name: true,
            },
          },
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

  const postsWithFlags = posts.map(({ likes, pins, author, hashtags, media, ...rest }) => ({
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
    hashtags: hashtags.map((entry) => entry.hashtag.name),
  }));

  return NextResponse.json(postsWithFlags);
}
