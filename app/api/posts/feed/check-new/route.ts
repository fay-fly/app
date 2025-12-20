import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? session.user.id : null;
  const { searchParams } = new URL(req.url);
  const sinceIdParam = searchParams.get("sinceId");
  const sinceId = sinceIdParam ? Number(sinceIdParam) : null;

  if (!userId) {
    return NextResponse.json({ count: 0, hasNew: false });
  }

  if (!sinceId) {
    return NextResponse.json({ count: 0, hasNew: false });
  }

  // Count posts from followed users that are newer than sinceId
  const newPostsCount = await prisma.post.count({
    where: {
      author: {
        followers: {
          some: { followerId: userId },
        },
      },
      id: { gt: sinceId },
    },
  });

  // Count new pins from followed users
  const newPinsCount = await prisma.pin.count({
    where: {
      user: {
        followers: {
          some: { followerId: userId },
        },
      },
      post: {
        id: { gt: sinceId },
      },
    },
  });

  const totalNew = newPostsCount + newPinsCount;

  return NextResponse.json({
    count: totalNew,
    hasNew: totalNew > 0,
  });
}