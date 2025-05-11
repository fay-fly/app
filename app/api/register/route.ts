import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import UserCreateInput = Prisma.UserCreateInput;

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(req: Request) {
  console.log("trigger");
  try {
    const user = await req.json() as UserCreateInput;
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists with that email" }),
        { status: 400 }
      );
    }
    const hashedPassword = await hash(user.password, 12);
    console.log({
      ...user,
      password: hashedPassword
    })
    const newUser = await prisma.user.create({
      data: {
        ...user,
        birthDate: new Date(user.birthDate),
        password: hashedPassword
      },
    });
    console.log("test");
    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch(error) {
    return new Response(
      JSON.stringify({ error: JSON.stringify(error) }),
      { status: 500 }
    );
  }
}
