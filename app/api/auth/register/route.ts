import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import UserCreateInput = Prisma.UserCreateInput;
import {addMinutes} from "date-fns";
import {Resend} from "resend";

const resend = new Resend("re_SvQEsLZP_3s8N5odQ9dAqZoMU3KsB97LC");

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: Request) {
  const user = await req.json() as UserCreateInput;
  const hashedPassword = await hash(user.password, 12);
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  const expiry = addMinutes(new Date(), 15)
  await prisma.user.create({
    data: {
      ...user,
      birthDate: new Date(user.birthDate),
      password: hashedPassword,
      emailVerificationCode: code,
      emailVerificationExpiry: expiry,
    },
  });
  const { error } = await resend.emails.send({
    from: 'fayflay@thelauris.com',
    to: user.email,
    subject: 'Email verification',
    html: `<p>${code}<p>`,
  });

  console.log("failed", error);
  return new Response(null, { status: 200 });
}
