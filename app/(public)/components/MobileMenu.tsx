"use client";
import menuConfig from "@/app/(public)/components/menuConfig";
import MenuLink from "@/app/(public)/components/MenuLink";
import {useSafeSession} from "@/hooks/useSafeSession";

export default function MobileMenu() {
  const { session } = useSafeSession();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[48px] z-50 md:hidden w-full">
      {[...menuConfig]
        .sort((a, b) => a.mobileIndex - b.mobileIndex)
        .map((item) => {
          const MenuIcon = item.icon;
          return (
            (!item.requiresAuth || (item.requiresAuth && session)) && (
              <MenuLink key={item.route} href={item.route}>
                <MenuIcon />
              </MenuLink>
            )
          );
        })}
    </div>
  );
}
