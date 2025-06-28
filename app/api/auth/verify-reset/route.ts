import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "Token missing" }, { status: 400 });
  }
  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  if (user.resetTokenExpiry! < new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: null, resetTokenExpiry: null },
    });
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
  return NextResponse.json({ status: 200 });
}
