import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and code are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    user.emailVerificationCode !== code ||
    !user.emailVerificationExpiry ||
    user.emailVerificationExpiry < new Date()
  ) {
    return NextResponse.json(
      { error: "Invalid or expired code" },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpiry: null,
    },
  });

  return NextResponse.json({ success: true });
}
