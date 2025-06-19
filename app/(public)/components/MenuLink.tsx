'use client';
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
    <Link href={href} className={clsx(
      "flex gap-[8px] p-[12px]",
      isActive ? "text-(--fly-primary)" : "text-[#A0A0A0]",
    )}>
      {children}
    </Link>
  );
}
