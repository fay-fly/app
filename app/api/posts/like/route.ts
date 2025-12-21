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
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { postId } = (await req.json()) as { postId: number };

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId,
        },
      },
    });

    if (existingLike) {
      const transactionResult = await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            likesCount: {
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
            type: "LIKE",
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

      const operations: PrismaPromise<unknown>[] = [
        prisma.like.create({
          data: {
            userId: userId,
            postId,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            likesCount: {
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

      if (post.authorId !== userId) {
        operations.push(
          prisma.notification.create({
            data: {
              type: "LIKE",
              message: "Liked your post",
              senderId: userId,
              receiverId: post.authorId,
              postId,
            },
          })
        );
      }

      const result = await prisma.$transaction(operations);
      const updatedPost = result[1] as PostCounts;

      return NextResponse.json({
        status: 200,
        likesCount: updatedPost._count.likes,
        commentsCount: updatedPost._count.comments,
        pinsCount: updatedPost._count.pins,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process like" },
      { status: 500 }
    );
  }
}
