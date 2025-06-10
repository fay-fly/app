import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { addHours } from "date-fns";

const prisma = new PrismaClient();

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
  return new Response(null, { status: 200 });
}
