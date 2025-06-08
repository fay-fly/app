import "../globals.css";
import RightSidebar from "@/app/(public)/components/RightSidebar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full">
      <div className="h-full w-[308px] p-[16px] border-r-1 border-(--fly-border-color)"></div>
      <div className="flex-1">{children}</div>
      <div className="h-full w-[308px] p-[16px] border-l-1 border-(--fly-border-color)">
        <RightSidebar />
      </div>
    </div>
  );
}
