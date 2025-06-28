import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { addHours } from "date-fns";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_KEY);

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
  const token = uuidv4();
  const expiry = addHours(new Date(), 1);
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const { error } = await resend.emails.send({
    from: "fayfly@thelauris.com",
    to: email,
    subject: "Password Reset",
    html: `<div>
        <p>We received a request to reset your password. You can reset your password by clicking the link below:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request a password reset, please ignore this email. This link will expire in 1 hour for security reasons.</p>
    <div>`,
  });
  if (error) {
    return NextResponse.json(
      { message: "Failed to send reset email" },
      { status: 500 }
    );
  }
  return NextResponse.json({ status: 200 });
}
