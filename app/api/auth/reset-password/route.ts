import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import {NextRequest, NextResponse} from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();
  if (!token || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { message: "Token and a password (min 8 chars) are required" },
      { status: 400 }
    );
  }
  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  });
  if (!user) {
    return NextResponse.json(
      { message: "Invalid reset link" },
      { status: 401 }
    );
  }
  const now = new Date();
  if (user.resetTokenExpiry! < now) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: null, resetTokenExpiry: null },
    });
    return NextResponse.json(
      { message: "Password reset link is expired" },
      { status: 401 }
    );
  }
  const hashedPassword = await hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  return NextResponse.json({ email: user.email }, { status: 200 });
}
