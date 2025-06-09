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
    return new Response(JSON.stringify({ error: "Email doesn't exist" }), { status: 404 });
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
    from: 'fayfly@thelauris.com',
    to: email,
    subject: 'Password Reset',
    html: `<div>
        <p>We received a request to reset your password. You can reset your password by clicking the link below:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request a password reset, please ignore this email. This link will expire in 1 hour for security reasons.</p>
    <div>`,
  });
  if (error) {
    return new Response(JSON.stringify({ error: "Failed to send reset email" }), { status: 500 });
  }
  return new Response(null, { status: 200 });
}
