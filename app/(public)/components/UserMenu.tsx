import { signOut } from "next-auth/react";
import Link from "next/link";
import clsx from "clsx";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import Logout from "@/icons/user-menu/Logout";
import Profile from "@/icons/user-menu/Profile";
import { useSafeSession } from "@/hooks/useSafeSession";
import UserCard from "@/app/(public)/components/UserCard";

const menuItemClassName = clsx(
  "flex items-center gap-[8px] px-[16px] py-[10px] color-[#5B5B5B]",
  "max-h-[40px] max-h-[40px] cursor-pointer"
);

export default function UserMenu() {
  const { session } = useSafeSession();

  if (!session) {
    return null;
  }

  return (
    <div className="flex gap-[8px] items-center">
      <Menu
        menuButton={
          <MenuButton>
            <UserCard
              user={{
                username: session.user.username,
                image: session.user.image,
                role: session.user.role,
              }}
              showStatus={true}
              hideUsername={true}
              size={32}
            />
          </MenuButton>
        }
        transition
        menuClassName={clsx(
          "bg-(--fly-white) font-[14px] text-[#5B5B5B]",
          "whitespace-nowrap shadow-md shadow-black/10 rounded z-50"
        )}
        position="anchor"
        gap={12}
      >
        <MenuItem
          href={`/profile/${session.user.username}`}
          className={menuItemClassName}
        >
          <Profile /> View profile
        </MenuItem>
        <MenuItem onClick={() => signOut()} className={menuItemClassName}>
          <Logout /> Log out
        </MenuItem>
      </Menu>
    </div>
  );
}
