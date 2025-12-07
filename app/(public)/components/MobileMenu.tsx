"use client";
import menuConfig from "@/app/(public)/components/menuConfig";
import MenuLink from "@/app/(public)/components/MenuLink";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useNotificationCount } from "@/contexts/NotificationContext";

export default function MobileMenu() {
  const { session } = useSafeSession();
  const { unreadCount } = useNotificationCount();

  return (
    <div
      className="fixed left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[48px] md:hidden w-full"
      style={{ bottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      {[...menuConfig]
        .sort((a, b) => a.mobileIndex - b.mobileIndex)
        .map((item) => {
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
              </MenuLink>
            )
          );
        })}
    </div>
  );
}
