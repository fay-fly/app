import { signOut } from "next-auth/react";
import clsx from "clsx";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import Logout from "@/icons/user-menu/Logout";
import Profile from "@/icons/user-menu/Profile";
import Login from "@/icons/user-menu/Login";
import { useSafeSession } from "@/hooks/useSafeSession";
import UserCard from "@/app/(public)/components/UserCard";

const menuItemClassName = clsx(
  "flex items-center gap-[8px] px-[16px] py-[10px] color-[#5B5B5B]",
  "max-h-[40px] max-h-[40px] cursor-pointer"
);

export default function UserMenu() {
  const { session } = useSafeSession();

  // Not logged in - show blank avatar with login dropdown
  if (!session) {
    return (
      <div className="flex gap-[8px] items-center">
        <Menu
          menuButton={
            <MenuButton>
              <div className="w-[32px] h-[32px] rounded-full bg-[#E8E8E8] flex items-center justify-center cursor-pointer">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    fill="#A0A0A0"
                  />
                  <path
                    d="M12 14.5C6.99 14.5 2.91 17.86 2.91 22C2.91 22.28 3.13 22.5 3.41 22.5H20.59C20.87 22.5 21.09 22.28 21.09 22C21.09 17.86 17.01 14.5 12 14.5Z"
                    fill="#A0A0A0"
                  />
                </svg>
              </div>
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
          <MenuItem href="/auth/login" className={menuItemClassName}>
            <Login /> Log in
          </MenuItem>
        </Menu>
      </div>
    );
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
