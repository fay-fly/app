import "../globals.css";
import RightSidebar from "@/app/(public)/components/RightSidebar";
import LeftSidebar from "@/app/(public)/components/LeftSidebar";
import { LayoutProps } from "@/app/types/layout";

export default function PublicLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-full">
      <LeftSidebar />
      <div className="flex-1">{children}</div>
      <RightSidebar />
    </div>
  );
}
