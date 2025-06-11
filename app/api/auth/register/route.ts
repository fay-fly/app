import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import UserCreateInput = Prisma.UserCreateInput;
import { addMinutes } from "date-fns";
import { Resend } from "resend";
import {NextRequest, NextResponse} from "next/server";
import {getAgeFromDob} from "@/utils/dates";

const resend = new Resend(process.env.RESEND_KEY);

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const user = (await req.json()) as UserCreateInput;
  const hashedPassword = await hash(user.password!, 12);
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiry = addMinutes(new Date(), 15);
  const emailExists = await prisma.user.findUnique({ where: { email: user.email } });
  if (emailExists) {
    return NextResponse.json(
      { message: `${user.email} is already taken` },
      { status: 404,}
    );
  }
  const usernameExists = await prisma.user.findUnique({ where: { username: user.username ?? "" } });
  if (usernameExists) {
    return NextResponse.json(
      { message: `${user.username} is already taken` },
      { status: 404,}
    );
  }
  if (getAgeFromDob(new Date(user.birthDate!)) < 18) {
    return NextResponse.json(
      { message: `Sorry, our service is intended for adult audiences only. We look forward to seeing you when you turn 18.` },
      { status: 404,}
    );
  }
  await prisma.user.create({
    data: {
      ...user,
      birthDate: new Date(user.birthDate!),
      password: hashedPassword,
      emailVerificationCode: code,
      emailVerificationExpiry: expiry,
    },
  });
  const { error } = await resend.emails.send({
    from: "fayfly@thelauris.com",
    to: user.email,
    subject: "Email verification",
    html: `<div>
      <p>Thanks for registration! To complete your registration, please verify your email address using the code below:</p>      
      <p>${code}<p>
      <p>This code will expire in 15 minutes. If you didn’t request this, you can safely ignore this email.</p>
    </div>`,
  });
  if (error) {
    return NextResponse.json(
      { message: "Failed to send reset email" },
      { status: 500 }
    );
  }
  return NextResponse.json({ status: 200 });
}
