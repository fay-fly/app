import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const user = await req.body;
  const hashedPassword = await hash(user.password, 12);
  await prisma.user.create({
    data: {
      ...user,
      birthDate: new Date(user.birthDate),
      password: hashedPassword
    },
  });
  return res.status(200);
}
