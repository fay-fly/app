import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
  description: "FlyFlay login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className="bg-(--fly-bg-primary)">
    <div className="flex flex-col h-full">
      <div
        className="flex flex-col items-center justify-center w-full flex-1"
      >
        {children}
      </div>
      <div className="w-full p-[16px]">
        <ul className="flex gap-[32px] justify-center text-(--fly-text-disabled) text-[12px]">
          <li>
            <Link href="/term-of-use">Terms of Use</Link>
          </li>
          <li>
            <Link href="/privacy-policy">Privacy policy</Link>
          </li>
          <li>
            <Link href="/contacts">Contacts</Link>
          </li>
          <li>
            <Link href="/about-us">About Us</Link>
          </li>
          <li>Copyright © {new Date().getFullYear()}</li>
        </ul>
      </div>
    </div>
    </body>
    </html>
  );
}
