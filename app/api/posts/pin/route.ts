import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { PrismaPromise } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { postId } = (await req.json()) as { postId: number };

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userHasPinnedPost = await prisma.pin.findUnique({
    where: {
      userId_postId: {
        userId: userId,
        postId: postId,
      },
    },
  });

  if (userHasPinnedPost) {
    await prisma.$transaction([
      prisma.pin.delete({
        where: { id: userHasPinnedPost.id },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          pinsCount: {
            decrement: 1,
          },
        },
      }),
      prisma.notification.deleteMany({
        where: {
          senderId: userId,
          postId,
          type: "PIN",
        },
      }),
    ]);

    return NextResponse.json({ status: 200 });
  } else {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post doesn't exist" },
        { status: 404 }
      );
    }

    if (post.authorId === userId) {
      return NextResponse.json(
        { error: "You cannot pin your own post" },
        { status: 400 }
      );
    }

    const operations: PrismaPromise<unknown>[] = [
      prisma.pin.create({
        data: {
          userId: userId,
          postId,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          pinsCount: {
            increment: 1,
          },
        },
      }),
    ];

    operations.push(
      prisma.notification.create({
        data: {
          type: "PIN",
          message: "Pinned your post",
          senderId: userId,
          receiverId: post.authorId,
          postId,
        },
      })
    );

    await prisma.$transaction(operations);

    return NextResponse.json({ status: 200 });
  }
}
