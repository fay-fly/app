import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PrismaPromise } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { followingId } = (await req.json()) as { followingId: number };

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (userId === followingId) {
    return NextResponse.json(
      { error: "You cannot follow yourself" },
      { status: 400 }
    );
  }

  const existingSubscription = await prisma.subscription.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId,
      },
    },
  });

  if (existingSubscription) {
    await prisma.$transaction([
      prisma.subscription.delete({
        where: { id: existingSubscription.id },
      }),
      prisma.notification.deleteMany({
        where: {
          senderId: userId,
          receiverId: followingId,
          type: "FOLLOW",
        },
      }),
    ]);

    return NextResponse.json({
      status: 200,
      message: "Unfollowed successfully",
      isSubscribed: false,
    });
  } else {
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const operations: PrismaPromise<unknown>[] = [
      prisma.subscription.create({
        data: {
          followerId: userId,
          followingId,
        },
      }),
    ];

    if (targetUser.id !== userId) {
      operations.push(
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            message: "Started following you",
            senderId: userId,
            receiverId: targetUser.id,
          },
        })
      );
    }

    await prisma.$transaction(operations);

    return NextResponse.json({
      status: 200,
      message: "Followed successfully",
      isSubscribed: true,
    });
  }
}
