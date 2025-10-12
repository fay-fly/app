import Link from "next/link";
import Logo from "@/icons/Logo";
import UserMenu from "@/app/(public)/components/UserMenu";

export default function MobileHeader() {
  return (
    <div className="w-full flex bg-white border-b border-gray-200 justify-between items-center px-[16px] h-[56px] md:hidden sticky top-0 z-50">
      <Link href="/">
        <Logo />
      </Link>
      <UserMenu />
    </div>
  );
}
