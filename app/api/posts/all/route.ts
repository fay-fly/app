import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
      likes: {
        where: { userId: parseInt(userId) },
        select: { id: true },
      },
    },
  });
  const postsWithLikeStatus = posts.map(({ likes, ...rest }) => ({
    ...rest,
    likedByMe: likes.length > 0,
  }));
  return NextResponse.json(postsWithLikeStatus);
}
