"use client";
import MenuLink from "@/app/(public)/components/MenuLink";
import menuConfig from "@/app/(public)/components/menuConfig";
import { useSafeSession } from "@/hooks/useSafeSession";
import Logo from "@/icons/Logo";
import Link from "next/link";

export default function LeftSidebar() {
  const { session } = useSafeSession();
  return (
    <div className="h-full w-[220px] px-[32px] hidden md:block fixed border-r-1 border-(--fly-border-color) pt-[25px]">
      <Link href="/" className="mt-[15px] mb-[15px]">
        <Logo />
      </Link>
      <div className="flex flex-col mt-[20px]">
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
