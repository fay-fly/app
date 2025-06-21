"use client";
import RightSidebar from "@/app/(public)/components/RightSidebar";
import LeftSidebar from "@/app/(public)/components/LeftSidebar";
import { LayoutProps } from "@/app/types/layout";
import Logo from "@/icons/Logo";
import Home from "@/icons/menu/Home";
import Discover from "@/icons/menu/Discover";
import AddPost from "@/icons/menu/AddPost";
import Notifications from "@/icons/menu/Notifications";
import Messages from "@/icons/menu/Messages";
import {SessionProvider} from "next-auth/react";
import UserCard from "@/app/(public)/components/UserCard";
import MenuLink from "@/app/(public)/components/MenuLink";

export default function PublicLayout({ children }: LayoutProps) {
  return (
    <SessionProvider>
      <div className="flex flex-col h-full pt-[60px] md:pt-0 md:flex-row">
        <div
          className="fixed top-0 left-0 right-0 flex bg-white border-b border-gray-200 flex justify-between items-center px-[16px] h-[56px] z-50 md:hidden w-full">
          <Logo/>
          <UserCard />
        </div>
        <LeftSidebar/>
        <div className="w-full md:mr-[308px] md:ml-[308px] bg-white">{children}</div>
        <RightSidebar/>
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[48px] z-50 md:hidden w-full">
          <MenuLink href="/"><Home /></MenuLink>
          <MenuLink href="/discover"><Discover/></MenuLink>
          <MenuLink href="/add-post"><AddPost /></MenuLink>
          <MenuLink href="/notifications"><Notifications /></MenuLink>
          <MenuLink href="/messages"><Messages /></MenuLink>
        </div>
      </div>
    </SessionProvider>
  );
}
