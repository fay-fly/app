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
        },
      },
      post: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(notifications);
}
