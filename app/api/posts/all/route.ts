import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { id: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
        },
      },
    },
  });
  return NextResponse.json(posts);
}
