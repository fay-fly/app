"use client";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/Button";
import clsx from "clsx";

function UserCard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (!session) {
    return (
      <Link href="/auth/login" className="text-(--fly-primary) text-semibold">
        Login
      </Link>
    );
  }

  return (
    <div className="flex">
      <div className="flex gap-[8px] items-center">
        <div className="w-[32px] h-[32px] relative">
          <div
            className={clsx(
              "w-full h-full bg-(--fly-primary) flex",
              "justify-center items-center text-(--fly-white) rounded-full"
            )}
          >
            {session.user.username?.charAt(0).toUpperCase()}
          </div>
          <span
            className={clsx(
              "absolute bottom-0 right-0 block w-[8px] h-[8px]",
              "bg-(--fly-success) border-1 border-white rounded-full"
            )}
          ></span>
        </div>
        <span className="text-(--fly-text-primary) text-semibold">
          {session.user.username}
        </span>
      </div>
      <Button
        type="button"
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="text-(--fly-primary)"
      >
        Sign Out
      </Button>
    </div>
  );
}

export default function RightSidebar() {
  return (
    <SessionProvider>
      <div className="h-full w-[308px] p-[16px] border-l-1 border-(--fly-border-color)">
        <UserCard />
      </div>
    </SessionProvider>
  );
}
