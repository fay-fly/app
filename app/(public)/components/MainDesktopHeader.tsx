import UserMenu from "@/app/(public)/components/UserMenu";
import DiscoverSearchInput from "@/app/(public)/components/DiscoverSearchInput";
import Logo from "@/icons/Logo";
import Link from "next/link";

export function MainDesktopHeader() {
  return (
    <div className="hidden md:flex h-[56px] bg-[#f9f9f9] border-b border-[#ededed] items-center w-full">
      {/* Logo box - 220px to align with sidebar */}
      <div className="w-[220px] h-[56px] flex flex-col items-start justify-center px-[32px] shrink-0">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      {/* Content area - search centered with avatar sharing space */}
      <div className="flex-1 flex items-center gap-[16px] px-[32px]">
        {/* Left spacer - takes same space as right side for centering */}
        <div className="w-[32px] shrink-0" />

        {/* Search box - centered, flexible width */}
        <div className="flex-1 flex justify-center min-w-0">
          <DiscoverSearchInput
            variant="desktop"
            wrapperClassName="w-full max-w-[612px]"
          />
        </div>

        {/* User menu - right side, fixed width */}
        <div className="shrink-0">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
