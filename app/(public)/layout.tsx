"use client";
import LeftSidebar from "@/app/(public)/components/LeftSidebar";
import { LayoutProps } from "@/types/layout";
import MobileMenu from "@/app/(public)/components/MobileMenu";
import { MainDesktopHeader } from "@/app/(public)/components/MainDesktopHeader";
import MobileHeader from "@/app/(public)/components/MobileHeader";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function PublicLayout({ children }: LayoutProps) {
  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen">
        {/* Desktop Header - fixed at top, full width */}
        <div className="hidden md:block fixed top-0 left-0 right-0 z-20">
          <MainDesktopHeader />
        </div>

        {/* Mobile Header */}
        <MobileHeader />

        {/* Sidebar - fixed, below header */}
        <LeftSidebar />

        {/* Main content area */}
        <div className="flex-1 bg-white md:ml-[220px] md:mt-[56px] mb-[48px] md:mb-0">
          <main>{children}</main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileMenu />
      </div>
    </NotificationProvider>
  );
}
