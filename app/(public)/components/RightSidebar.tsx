"use client";
import UserCard from "@/app/(public)/components/UserCard";

export default function RightSidebar() {
  return <div className="h-full w-[308px] p-[16px] border-l-1 border-(--fly-border-color) hidden md:block fixed top-0 right-0">
    <UserCard />
  </div>;
}
