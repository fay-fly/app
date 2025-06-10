import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Token missing" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  });

  if (!user || user.resetTokenExpiry! < new Date()) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpiry: null },
      });
    }
    return NextResponse.json(
      { valid: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  return NextResponse.json({ valid: true }, { status: 200 });
}
