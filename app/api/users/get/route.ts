import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      posts: true,
      pins: {
        include: {
          post: {
            include: {
              author: true,
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
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
