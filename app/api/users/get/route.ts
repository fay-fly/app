import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ? session.user.id : null;

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  console.log("test", username);
  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
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
      pins: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          post: {
            include: {
              author: true,
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
      },
      _count: {
        select: {
          followers: true,
          subscriptions: true,
        },
      },
      ...(currentUserId && {
        followers: {
          where: { followerId: currentUserId },
          select: { id: true },
        },
      }),
    },
  });

  if (!user) {
    console.log("test2", username);
    console.log("test3", JSON.stringify(user));
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { followers, ...restUser } = user as typeof user & {
    followers?: { id: number }[];
  };

  return NextResponse.json({
    ...restUser,
    isFollowedByMe: currentUserId ? (followers?.length ?? 0) > 0 : false,
  });
}
