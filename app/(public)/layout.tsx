import "../globals.css";
import RightSidebar from "@/app/(public)/components/RightSidebar";
import Logo from "@/icons/Logo";
import Link from "next/link";
import Discover from "@/icons/menu/Discover";
import Messages from "@/icons/menu/Messages";
import Notifications from "@/icons/menu/Notifications";
import AddPost from "@/icons/menu/AddPost";
import Home from "@/icons/menu/Home";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full">
      <div className="h-full w-[308px] p-[16px] border-r-1 border-(--fly-border-color)">
        <div className="ml-[36px]">
          <div className="p-[8px]">
            <Logo/>
          </div>
          <div className="flex flex-col mt-[16px]">
            <Link href="/" className="flex text-[#A0A0A0] gap-[8px] p-[8px]">
              <Home />
              Home
            </Link>
            <Link href="/discover" className="flex text-[#A0A0A0] gap-[8px] p-[8px]">
              <Discover />
              Discover
            </Link>
            <Link href="/messages" className="flex text-[#A0A0A0] gap-[8px] p-[8px]">
              <Messages />
              Messages
            </Link>
            <Link href="/notifications" className="flex text-[#A0A0A0] gap-[8px] p-[8px]">
              <Notifications />
              Notifications
            </Link>
            <Link href="/add-post" className="flex text-[#A0A0A0] gap-[8px] p-[8px]">
              <AddPost />
              Add post
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1">{children}</div>
      <RightSidebar />
    </div>
  );
}
