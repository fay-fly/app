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
          media: {
            orderBy: { order: "asc" },
            select: {
              url: true,
              thumbnailUrl: true,
              smallUrl: true,
              mediumUrl: true,
              originalUrl: true,
              width: true,
              height: true,
            },
          },
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
    post: notification.post
      ? {
          ...notification.post,
          media: notification.post.media.map(m => ({
            url: m.url,
            thumbnailUrl: m.thumbnailUrl ?? undefined,
            smallUrl: m.smallUrl ?? undefined,
            mediumUrl: m.mediumUrl ?? undefined,
            originalUrl: m.originalUrl ?? undefined,
            width: m.width,
            height: m.height,
          })),
        }
      : null,
  }));

  return NextResponse.json(mapped);
}
