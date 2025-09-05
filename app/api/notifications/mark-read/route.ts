import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: {
      receiverId: userId,
      read: false
    },
    data: {
      read: true
    }
  });
  return NextResponse.json({ status: 200 });
}