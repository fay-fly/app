import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { username } = await req.json();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      username,
    },
  })
  return new Response(null, { status: 200 });
}
