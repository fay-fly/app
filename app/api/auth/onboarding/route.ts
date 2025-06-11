import { PrismaClient } from "@prisma/client";
import {NextRequest, NextResponse} from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId, birthDate, username } = await req.json();
  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      username,
      birthDate: new Date(birthDate),
      role: "user",
    },
  });
  return NextResponse.json({ status: 200 });
}
