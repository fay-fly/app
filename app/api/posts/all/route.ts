import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const posts = await prisma.post.findMany({
    orderBy: { id: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
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
          }
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

  const postsWithLikeStatus = posts.map(({ likes, pins, ...rest }) => ({
    ...rest,
    likedByMe: userId
      ? likes.length > 0
      : false,
    pinnedByMe: userId
      ? pins.length > 0
      : false,
  }));

  return NextResponse.json(postsWithLikeStatus);
}
