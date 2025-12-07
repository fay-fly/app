"use client";
import "./globals.css";
import { LayoutProps } from "@/app/types/layout";
import ToastProvider from "@/providers/ToastProvider";
import { SessionProvider } from "next-auth/react";
import AppAuthWrapper from "@/components/AppAuthWrapper";

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className="h-full bg-(--fly-bg-primary)">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="preconnect"
          href="https://ovlcstnavogaxoxh.public.blob.vercel-storage.com"
          crossOrigin="anonymous"
        />
      </head>
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
