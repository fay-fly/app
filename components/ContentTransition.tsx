"use client";
import { ReactNode, useState, useEffect } from "react";
import clsx from "clsx";

type ContentTransitionProps = {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function ContentTransition({
  isLoading,
  skeleton,
  children,
  className,
}: ContentTransitionProps) {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoading && showSkeleton) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
    if (isLoading) {
      setShowSkeleton(true);
    }
  }, [isLoading, showSkeleton]);

  return (
    <div className={clsx("relative", className)}>
      {showSkeleton && (
        <div className={clsx(isTransitioning && "animate-fade-out")}>
          {skeleton}
        </div>
      )}
      {!showSkeleton && (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
