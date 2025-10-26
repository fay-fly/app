"use client";
import MenuLink from "@/app/(public)/components/MenuLink";
import menuConfig from "@/app/(public)/components/menuConfig";
import { useSafeSession } from "@/hooks/useSafeSession";
import Logo from "@/icons/Logo";
import Link from "next/link";
import { useNotificationCount } from "@/contexts/NotificationContext";

export default function LeftSidebar() {
  const { session } = useSafeSession();
  const { unreadCount } = useNotificationCount();

  return (
    <div className="h-full w-[220px] px-[32px] hidden md:block fixed border-r-1 border-(--fly-border-color) pt-[25px]">
      <Link href="/" className="mt-[15px] mb-[15px]">
        <Logo />
      </Link>
      <div className="flex flex-col mt-[20px]">
        {menuConfig.map((item) => {
          const MenuIcon = item.icon;
          const showBadge = item.route === "/notifications" && unreadCount > 0;

          return (
            (!item.requiresAuth || (item.requiresAuth && session)) && (
              <MenuLink key={item.route} href={item.route}>
                <div className="relative">
                  <MenuIcon />
                  {showBadge && (
                    <div className="absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-[4px]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </div>
                {item.text}
              </MenuLink>
            )
          );
        })}
      </div>
    </div>
  );
}
