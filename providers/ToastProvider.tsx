"use client";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {children}
      <Toaster
        position={isMobile ? "bottom-left" : "bottom-right"}
        duration={3000}
        toastOptions={{
          classNames: {
            success: "bg-blue-600 text-white",
            error: "bg-red-600 text-white",
            info: "bg-gray-600 text-white",
            warning: "bg-orange-400 text-white",
          },
        }}
      />
    </>
  );
}
