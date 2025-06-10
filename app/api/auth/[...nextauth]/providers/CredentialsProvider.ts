import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials) {
      throw new Error("Credentials must be provided");
    }

    if (!credentials.email || !credentials.password) {
      throw new Error("Missing email or password");
    }

    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error("No user found with this email");
    }

    if (!user.password) {
      throw new Error("User doesn't have password set");
    }

    const isValidPassword = await compare(credentials.password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    return {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    };
  },
});
