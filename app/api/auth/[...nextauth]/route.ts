import NextAuth, { AuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "./providers/GoogleProvider";
import CredentialsProvider from "./providers/CredentialsProvider";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string | null;
    role: string;
  }
}

const prisma = new PrismaClient();

const authOptions: AuthOptions = {
  providers: [CredentialsProvider, GoogleProvider],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id.toString();
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.image = dbUser.picturePath ? dbUser.picturePath : null;
        }
      } else if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.username = token.username;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              email: user.email!,
              role: "lead",
              emailVerified: true,
              picturePath: user.image,
            },
          });
        }
        if (!existingUser.birthDate) {
          return `/auth/onboarding?${new URLSearchParams({
            userId: existingUser.id.toString(),
          })}`;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
