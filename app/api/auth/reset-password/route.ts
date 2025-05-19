import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || typeof newPassword !== 'string' || newPassword.length < 6) {
    return NextResponse.json(
      { error: 'Token and a password (min 6 chars) are required' },
      { status: 400 }
    )
  }
  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired reset link' },
      { status: 401 }
    )
  }

  const now = new Date()
  if (user.resetTokenExpiry! < now) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: null, resetTokenExpiry: null },
    })
    return NextResponse.json(
      { error: 'Invalid or expired reset link' },
      { status: 401 }
    )
  }

  const hashedPassword = await hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return NextResponse.json({ success: true }, { status: 200 })
}