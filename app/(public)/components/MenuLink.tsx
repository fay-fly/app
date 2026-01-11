"use client";
import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

type MenuLinkProps = Readonly<{
  href: string;
  children: ReactNode;
}>;

export default function MenuLink({ href, children }: MenuLinkProps) {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex gap-[8px] h-[48px] items-center px-[16px] py-[8px] text-[16px] leading-[22px] font-normal",
        isActive ? "text-[#7c89ff]" : "text-[#807d7d]"
      )}
    >
      {children}
    </Link>
  );
}
