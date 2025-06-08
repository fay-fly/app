import "../globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <main
        className="flex flex-col items-center justify-center w-full flex-1 p-[24px]"
      >
        {children}
      </main>
      <footer className="w-full p-[32px] border-t-[1px] border-(--fly-border-color)">
        <ul className="flex gap-[32px] justify-center text-(--fly-text-disabled) text-[14px] flex-wrap">
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
      </footer>
    </div>
  );
}
