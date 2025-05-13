import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import UserCreateInput = Prisma.UserCreateInput;

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: Request) {
  const user = await req.json() as UserCreateInput;
  const hashedPassword = await hash(user.password, 12);
  await prisma.user.create({
    data: {
      ...user,
      birthDate: new Date(user.birthDate),
      password: hashedPassword
    },
  });
  return new Response(null, { status: 200 });
}
