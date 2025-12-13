import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? session.user.id : null;

  const posts = await prisma.post.findMany({
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

  const postsWithFlags = posts.map(({ likes, pins, author, ...rest }) => ({
    ...rest,
    author: {
      id: author?.id,
      username: author?.username,
      pictureUrl: author?.pictureUrl,
      role: author?.role,
    },
    likedByMe: userId ? likes.length > 0 : false,
    pinnedByMe: userId ? pins.length > 0 : false,
    isFollowed:
      userId && author?.followers ? author.followers.length > 0 : false,
  }));

  return NextResponse.json(postsWithFlags);
}
