"use client";
import LeftSidebar from "@/app/(public)/components/LeftSidebar";
import { LayoutProps } from "@/app/types/layout";
import Logo from "@/icons/Logo";
import UserCard from "@/app/(public)/components/UserCard";
import MobileMenu from "@/app/(public)/components/MobileMenu";
import Link from "next/link";

export default function PublicLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="hidden md:flex justify-between w-full px-[32px] py-[12px] border-b border-gray-200 bg-(--fly-bg-primary) fixed">
        <Link href="/">
          <Logo />
        </Link>
        <UserCard />
      </div>
      <div className="flex flex-col pt-[56px] md:pt-[59px] md:flex-row flex-1">
        <div className="fixed top-0 left-0 right-0 flex bg-white border-b border-gray-200 justify-between items-center px-[16px] h-[56px] z-50 md:hidden w-full">
          <Link href="/">
            <Logo />
          </Link>
          <UserCard />
        </div>
        <LeftSidebar />
        <div className="w-full bg-white flex-1 md:ml-[220px]">
          {children}
        </div>
        <MobileMenu />
      </div>
    </div>
  );
}
