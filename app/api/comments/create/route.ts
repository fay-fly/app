import { NextRequest, NextResponse } from "next/server";
import {Post, PrismaClient, PrismaPromise} from "@prisma/client";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const text = formData.get("text") as string;
  const postId = formData.get("postId") as string;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!text || !postId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
    select: { authorId: true }
  });

  if (!post) {
    return NextResponse.json({ error: "Post doesn't exist" }, { status: 404 });
  }

  const operations: Array<PrismaPromise<unknown>> = [
    prisma.comment.create({
      data: {
        text: text,
        postId: parseInt(postId),
        authorId: parseInt(userId),
      }
    }),
    prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    }),
  ]

  if (post.authorId !== parseInt(userId)) {
    operations.push(
      prisma.notification.create({
        data: {
          type: 'COMMENT',
          message: 'Commented on your post',
          senderId: parseInt(userId),
          receiverId: post.authorId,
          postId: parseInt(postId),
        },
      }),
    );
  }

  const [createdComment] = await prisma.$transaction(operations);

  const comment = await prisma.comment.findUnique({
    where: { id: (createdComment as Post).id },
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

  return NextResponse.json({ comment });
}
