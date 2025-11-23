import Link from "next/link";
import Logo from "@/icons/Logo";
import UserMenu from "@/app/(public)/components/UserMenu";
import DiscoverSearchInput from "@/app/(public)/components/DiscoverSearchInput";

export default function MobileHeader() {
  return (
    <div className="w-full bg-white border-b border-gray-200 md:hidden sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-3 px-[16px] py-[12px]">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <UserMenu />
        </div>
        <DiscoverSearchInput variant="mobile" />
      </div>
    </div>
  );
}
