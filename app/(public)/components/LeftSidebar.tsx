import Logo from "@/icons/Logo";
import Home from "@/icons/menu/Home";
import Discover from "@/icons/menu/Discover";
import Messages from "@/icons/menu/Messages";
import Notifications from "@/icons/menu/Notifications";
import AddPost from "@/icons/menu/AddPost";
import MenuLink from "@/app/(public)/components/MenuLink";

export default function LeftSidebar() {
  return (
    <div className="h-full w-[308px] p-[16px] border-r-1 border-(--fly-border-color) hidden md:block fixed">
      <div className="ml-[36px]">
        <div className="p-[12px]">
          <Logo />
        </div>
        <div className="flex flex-col mt-[16px]">
          <MenuLink href="/">
            <Home />
            Home
          </MenuLink>
          <MenuLink href="/discover">
            <Discover /> Discover
          </MenuLink>
          <MenuLink href="/messages">
            <Messages /> Messages
          </MenuLink>
          <MenuLink href="/notifications">
            <Notifications /> Notifications
          </MenuLink>
          <MenuLink href="/add-post">
            <AddPost /> Add post
          </MenuLink>
        </div>
      </div>
    </div>
  );
}
