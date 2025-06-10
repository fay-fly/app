import "./globals.css";
import { LayoutProps } from "@/app/types/layout";
import ToastProvider from "@/providers/ToastProvider";

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className="h-full bg-(--fly-bg-primary)">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
