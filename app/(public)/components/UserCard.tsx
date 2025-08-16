import { signOut } from "next-auth/react";
import Link from "next/link";
import clsx from "clsx";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import Logout from "@/icons/user-menu/Logout";
import Profile from "@/icons/user-menu/Profile";
import {useSafeSession} from "@/hooks/useSafeSession";

const menuItemClassName = clsx(
  "flex items-center gap-[8px] px-[16px] py-[10px] color-[#5B5B5B]",
  "max-h-[40px] max-h-[40px] cursor-pointer"
);

export default function UserCard() {
  const { session } = useSafeSession();

  if (!session) {
    return (
      <Link href="/auth/login" className="text-(--fly-primary) text-semibold">
        Login
      </Link>
    );
  }

  return (
    <div className="flex">
      <div className="flex gap-[8px] items-center">
        <Menu
          menuButton={
            <MenuButton>
              <div className="w-[32px] h-[32px] relative cursor-pointer">
                {session.user.image
                  ? <img src={session.user.image} alt="profile image" className="rounded-full" />
                  : <div
                      className={clsx(
                      "w-full h-full bg-(--fly-primary) flex",
                      "justify-center items-center text-(--fly-white) rounded-full"
                      )}
                  >
                    {session.user.username?.charAt(0).toUpperCase()}
                  </div>}
                <span
                  className={clsx(
                    "absolute bottom-0 right-0 block w-[8px] h-[8px]",
                    "bg-(--fly-success) border-1 border-white rounded-full"
                  )}
                ></span>
              </div>
            </MenuButton>
          }
          transition
          menuClassName={clsx(
            "bg-(--fly-white) font-[14px] text-[#5B5B5B]",
            "whitespace-nowrap shadow-md shadow-black/10 rounded"
          )}
          position="anchor"
          gap={12}
        >
          <MenuItem
            href={`/profile/${session.user.id}`}
            className={menuItemClassName}
          >
            <Profile /> View profile
          </MenuItem>
          <MenuItem onClick={() => signOut()} className={menuItemClassName}>
            <Logout /> Log out
          </MenuItem>
        </Menu>
        <span className="text-(--fly-text-primary) font-bold hidden md:block">
          {session.user.username}
        </span>
      </div>
    </div>
  );
}
