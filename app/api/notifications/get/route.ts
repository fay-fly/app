import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { receiver: { email: session.user?.email ?? "" } },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          role: true,
          followers: {
            where: { followerId: session.user?.id ?? 0 },
            select: { id: true },
          },
        },
      },
      post: {
        select: {
          id: true,
          imageUrls: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mapped = notifications.map((notification) => ({
    ...notification,
    senderFollowing:
      notification.sender?.followers &&
      notification.sender.followers.length > 0,
    sender: notification.sender
      ? {
          id: notification.sender.id,
          username: notification.sender.username,
          pictureUrl: notification.sender.pictureUrl,
          role: notification.sender.role,
        }
      : null,
  }));

  return NextResponse.json(mapped);
}
