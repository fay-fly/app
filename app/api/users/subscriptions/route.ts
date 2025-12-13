import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { followerId: parseInt(userId) },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json(subscriptions.map((s) => s.following));
}
