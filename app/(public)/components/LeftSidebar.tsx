"use client";
import MenuLink from "@/app/(public)/components/MenuLink";
import menuConfig from "@/app/(public)/components/menuConfig";
import { useSafeSession } from "@/hooks/useSafeSession";
import Settings from "@/icons/menu/Settings";
import Login from "@/icons/menu/Login";
import Link from "next/link";
import { useNotificationCount } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";

export default function LeftSidebar() {
  const { session } = useSafeSession();
  const { unreadCount } = useNotificationCount();
  const router = useRouter();

  const handlePostClick = () => {
    router.push("/add-post");
  };

  return (
    <div className="hidden md:flex flex-col fixed top-[56px] left-0 w-[220px] h-[calc(100vh-56px)] bg-[#f9f9f9] border-r border-[#ededed] z-10">
      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-between px-[16px] py-[24px]">
        {/* Top section - Menu items and Post button */}
        <div className="flex flex-col gap-[16px]">
          {/* Menu items */}
          <div className="flex flex-col">
            {menuConfig
              .filter((item) => {
                // Hide items marked as hideInDesktop
                if (item.hideInDesktop) return false;

                if (item.requiresAuth && !session) return false;

                if (item.requiredRoles && session) {
                  const hasRole = item.requiredRoles.includes(session.user.role);
                  if (!hasRole) return false;
                }

                return true;
              })
              .map((item) => {
                const MenuIcon = item.icon;
                const showBadge = item.route === "/notifications" && unreadCount > 0;

                return (
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
                );
              })}
          </div>

          {/* Post button - only show for creators/admins */}
          {session && (session.user.role === "creator" || session.user.role === "admin") && (
            <button
              onClick={handlePostClick}
              className="w-full h-[48px] bg-[#7c89ff] text-white font-semibold text-[16px] leading-[20px] tracking-[-0.32px] rounded-[100px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            >
              Post
            </button>
          )}
        </div>

        {/* Bottom section - Settings and Login */}
        <div className="flex flex-col">
          {/* <MenuLink href="/settings">
            <Settings />
            Setting
          </MenuLink> */}
          {!session ? (
            <MenuLink href="/auth/login">
              <Login />
              Log in
            </MenuLink>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#ededed] px-[32px] py-[24px]">
        <div className="text-[14px] leading-[20px] tracking-[-0.14px] text-[#807d7d]">
          <Link href="/privacy-policy" className="block cursor-pointer">Privacy Policy</Link>
          <Link href="/contacts" className="block cursor-pointer">Help and support</Link>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">© 2025 FayFlay</p>
        </div>
      </div>
    </div>
  );
}
