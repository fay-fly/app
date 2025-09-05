"use client";
import "./globals.css";
import { LayoutProps } from "@/app/types/layout";
import ToastProvider from "@/providers/ToastProvider";
import { SessionProvider } from "next-auth/react";
import AppAuthWrapper from "@/components/AppAuthWrapper";

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className="h-full bg-(--fly-bg-primary)">
      <body className="h-full">
        <ToastProvider>
          <SessionProvider>
            <AppAuthWrapper>{children}</AppAuthWrapper>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
