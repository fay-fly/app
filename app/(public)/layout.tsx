"use client";
import LeftSidebar from "@/app/(public)/components/LeftSidebar";
import { LayoutProps } from "@/app/types/layout";
import MobileMenu from "@/app/(public)/components/MobileMenu";
import { MainDesktopHeader } from "@/app/(public)/components/MainDesktopHeader";
import MobileHeader from "@/app/(public)/components/MobileHeader";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function PublicLayout({ children }: LayoutProps) {
  return (
    <NotificationProvider>
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row flex-1">
          <LeftSidebar />
          <div className="w-full bg-white flex-1 md:ml-[220px] mb-[48px] md:mb-0">
            <MobileHeader />
            <MainDesktopHeader />
            {children}
          </div>
          <MobileMenu />
        </div>
      </div>
    </NotificationProvider>
  );
}
