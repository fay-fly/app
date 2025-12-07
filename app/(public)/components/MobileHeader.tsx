"use client";
import Link from "next/link";
import Logo from "@/icons/Logo";
import UserMenu from "@/app/(public)/components/UserMenu";
import DiscoverSearchInput from "@/app/(public)/components/DiscoverSearchInput";
import SearchIcon from "@/icons/SearchIcon";
import Close from "@/icons/Close";
import { useState } from "react";

export default function MobileHeader() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="w-full bg-white border-b border-gray-200 md:hidden sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col px-[16px] py-[12px]">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center justify-center cursor-pointer"
              aria-label={showSearch ? "Close search" : "Open search"}
            >
              {showSearch ? <Close /> : <SearchIcon className="text-[#A0A0A0]" />}
            </button>
            <UserMenu />
          </div>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out ${
            showSearch ? "max-h-20 mt-3 opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{ overflow: showSearch ? "visible" : "hidden" }}
        >
          <DiscoverSearchInput variant="mobile" />
        </div>
      </div>
    </div>
  );
}
