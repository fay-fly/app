"use client";
import MenuLink from "@/app/(public)/components/MenuLink";
import menuConfig from "@/app/(public)/components/menuConfig";
import {useSafeSession} from "@/hooks/useSafeSession";
import Logo from "@/icons/Logo";
import Link from "next/link";

export default function LeftSidebar() {
  const { session } = useSafeSession();
  return (
    <div className="h-full w-[220px] px-[32px] hidden md:block fixed border-r-1 border-(--fly-border-color) pt-[12px]">
      <Link href="/">
        <Logo />
      </Link>
      <div className="flex flex-col mt-[16px]">
        {menuConfig.map((item) => {
          const MenuIcon = item.icon;
          return (
            (!item.requiresAuth || (item.requiresAuth && session)) && (
              <MenuLink key={item.route} href={item.route}>
                <MenuIcon />
                {item.text}
              </MenuLink>
            )
          );
        })}
      </div>
    </div>
  );
}
