'use client';
import {SessionProvider, signOut} from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";

function HomeContent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <Link href="/auth/login">Login</Link>;
  return <div>
    {JSON.stringify(session)}
    <button onClick={() => signOut({callbackUrl: '/'})}>Sign Out</button>
  </div>
}

export default function Home() {
  return <SessionProvider>
    <HomeContent></HomeContent>
  </SessionProvider>
}
