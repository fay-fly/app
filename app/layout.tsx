import type { ReactNode } from 'react';
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-(--fly-bg-primary)">
    <body>{children}</body>
    </html>
  );
}
