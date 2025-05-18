import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { addHours } from "date-fns";
import { Resend } from 'resend';

const resend = new Resend("re_SvQEsLZP_3s8N5odQ9dAqZoMU3KsB97LC");

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return new Response("Email doesn't exist", { status: 404 });
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

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  const { error } = await resend.emails.send({
    from: 'fayflay@thelauris.com',
    to: email,
    subject: 'Password Reset',
    html: `<p>Password reset link: <a href="${resetLink}">${resetLink}</a><p>`,
  });

  console.log("failed", error);
  return new Response(null, { status: 200 });
}
