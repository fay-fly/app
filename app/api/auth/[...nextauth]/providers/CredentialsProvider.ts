import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default CredentialsProvider({
  name: "Credentials",
  credentials: {
    identifier: { label: "Username or Email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.identifier || !credentials.password) {
      throw new Error("Missing username/email or password");
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: credentials.identifier },
          { username: credentials.identifier },
        ],
      },
    });

    if (!user) {
      throw new Error("No user found with this username or email");
    }

    if (!user.password) {
      throw new Error("User does not have a password set");
    }

    const isValid = await compare(credentials.password, user.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      image: user.pictureUrl,
    };
  },
});
