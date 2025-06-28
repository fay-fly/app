import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { message: "Email doesn't exist" },
      { status: 404 }
    );
  }
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: uuidv4(),
      resetTokenExpiry: addHours(new Date(), 1),
    },
  });
  return NextResponse.json({ status: 200 });
}
