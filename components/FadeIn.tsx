"use client";
import { ReactNode } from "react";
import clsx from "clsx";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "none" | "up";
};

export default function FadeIn({
  children,
  className,
  delay = 0,
  direction = "none",
}: FadeInProps) {
  const animationClass = direction === "up" ? "animate-fade-in-up" : "animate-fade-in";

  return (
    <div
      className={clsx(animationClass, className)}
      style={{
        animationDelay: delay ? `${delay}ms` : undefined,
        opacity: 0
      }}
    >
      {children}
    </div>
  );
}
