import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { PrismaPromise } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

type PostCounts = {
  _count: {
    likes: number;
    comments: number;
    pins: number;
  };
};

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
    const transactionResult = await prisma.$transaction([
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
        select: {
          _count: {
            select: {
              likes: true,
              comments: true,
              pins: true,
            },
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

    const updatedPost = transactionResult[1] as PostCounts;

    return NextResponse.json({
      status: 200,
      likesCount: updatedPost._count.likes,
      commentsCount: updatedPost._count.comments,
      pinsCount: updatedPost._count.pins,
    });
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
        select: {
          _count: {
            select: {
              likes: true,
              comments: true,
              pins: true,
            },
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

    const result = await prisma.$transaction(operations);
    const updatedPost = result[1] as PostCounts;

    return NextResponse.json({
      status: 200,
      likesCount: updatedPost._count.likes,
      commentsCount: updatedPost._count.comments,
      pinsCount: updatedPost._count.pins,
    });
  }
}
