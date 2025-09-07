"use client";
import LeftSidebar from "@/app/(public)/components/LeftSidebar";
import { LayoutProps } from "@/app/types/layout";
import Logo from "@/icons/Logo";
import UserMenu from "@/app/(public)/components/UserMenu";
import MobileMenu from "@/app/(public)/components/MobileMenu";
import Link from "next/link";
import { MainDesktopHeader } from "@/app/(public)/components/MainDesktopHeader";

export default function PublicLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row flex-1">
        <LeftSidebar />
        <div className="w-full bg-white flex-1 md:ml-[220px] mb-[48px] md:mb-0">
          <div className="w-full flex bg-white border-b border-gray-200 justify-between items-center px-[16px] h-[56px] md:hidden sticky top-0">
            <Link href="/">
              <Logo />
            </Link>
            <UserMenu />
          </div>
          <MainDesktopHeader />
          {children}
        </div>
        <MobileMenu />
      </div>
    </div>
  );
}
