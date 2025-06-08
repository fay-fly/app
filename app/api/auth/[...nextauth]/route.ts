import NextAuth, {AuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import path from "node:path";
import * as fs from "node:fs";
import * as https from "node:https";
import * as http from "node:http";
import {promisify} from "node:util";
import {pipeline} from "node:stream";
import {IncomingMessage} from "node:http";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string | null;
      role: string;
      image: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string | null;
    role: string;
    image: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string | null;
    role: string;
    image: string | null;
  }
}

// const streamPipeline = promisify(pipeline);

// async function saveImageFromUrl(imageUrl: string): Promise<string | undefined> {
//   if (!imageUrl) return;
//
//   const parsedUrl = new URL(imageUrl);
//   const ext = path.extname(parsedUrl.pathname).split('?')[0] || '.jpg';
//   const filename = `${crypto.randomUUID()}${ext}`;
//   const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
//   const filePath = path.join(uploadDir, filename);
//
//   fs.mkdirSync(uploadDir, { recursive: true });
//
//   const client = imageUrl.startsWith('https') ? https : http;
//
//   const response: IncomingMessage = await new Promise((resolve, reject) => {
//     client.get(imageUrl, (res) => {
//       if (res.statusCode !== 200) {
//         reject(new Error(`Failed to get image. Status code: ${res.statusCode}`));
//       } else {
//         resolve(res);
//       }
//     }).on('error', reject);
//   });
//   await streamPipeline(response, fs.createWriteStream(filePath));
//   return `/uploads/profiles/${filename}`;
// }



const prisma = new PrismaClient();

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
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
          image: user.picturePath
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
        if (dbUser) {
          token.id = dbUser.id.toString();
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.image = dbUser.picturePath
            ? dbUser.picturePath
            : null;
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
        session.user.image = token.image;
        session.user.username = token.username;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        let existingUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!existingUser) {
          // let savedImagePath = null;
          // if (user.image) {
          //   savedImagePath = await saveImageFromUrl(user.image);
          // }
          existingUser = await prisma.user.create({
            data: {
              email: user.email!,
              role: "lead",
              emailVerified: true,
              picturePath: user.image
            },
          });
        }

        if (!existingUser.birthDate) {
          return `/auth/onboarding?${new URLSearchParams({
            userId: existingUser.id.toString(),
          })}`
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
