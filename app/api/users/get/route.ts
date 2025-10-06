import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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
    console.log("test2", username);
    console.log("test3", JSON.stringify(user));
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
