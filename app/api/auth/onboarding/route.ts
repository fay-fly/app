import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: Request) {
  const { userId, birthDate, username } = await req.json();
  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      username,
      birthDate: new Date(birthDate),
      role: "user",
    },
  })
  return new Response(null, { status: 200 });
}
