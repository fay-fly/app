"use client";
import RightSidebar from "@/app/(public)/components/RightSidebar";
import LeftSidebar from "@/app/(public)/components/LeftSidebar";
import { LayoutProps } from "@/app/types/layout";
import Logo from "@/icons/Logo";
import UserCard from "@/app/(public)/components/UserCard";
import MobileMenu from "@/app/(public)/components/MobileMenu";

export default function PublicLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-full pt-[56px] md:pt-0 md:flex-row">
      <div className="fixed top-0 left-0 right-0 flex bg-white border-b border-gray-200 flex justify-between items-center px-[16px] h-[56px] z-50 md:hidden w-full">
        <Logo />
        <UserCard />
      </div>
      <LeftSidebar />
      <div className="w-full md:mr-[308px] md:ml-[308px]">{children}</div>
      <RightSidebar />
      <MobileMenu />
    </div>
  );
}
