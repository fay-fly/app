import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const subscribers = await prisma.subscription.findMany({
    where: { followingId: parseInt(userId) },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
        },
      },
    },
  });

  return NextResponse.json(subscribers.map((s) => s.follower));
}