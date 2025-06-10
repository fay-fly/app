import Link from "next/link";
import { ReactNode } from "react";

type MenuLinkProps = Readonly<{
  href: string;
  children: ReactNode;
}>;

export default function MenuLink({ href, children }: MenuLinkProps) {
  return (
    <Link href={href} className="flex text-[#A0A0A0] gap-[8px] p-[8px]">
      {children}
    </Link>
  );
}
