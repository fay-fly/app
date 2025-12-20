"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { PostMediaItem } from "@/types/postWithUser";

type MediaCarouselProps = {
  media: PostMediaItem[];
  currentIndex: number;
  onChange: (index: number) => void;
  onDoubleClick?: () => void;
  className?: string;
  showControls?: boolean;
  showIndicators?: boolean;
  ariaLabel?: string;
  children?: React.ReactNode;
  rounded?: boolean;
  objectFit?: "cover" | "contain";
  useAspectRatio?: boolean;
};

const MIN_SWIPE_DISTANCE = 45;

export default function MediaCarousel({
  media,
  currentIndex,
  onChange,
  onDoubleClick,
  className,
  showControls = true,
  showIndicators = true,
  ariaLabel = "Post media carousel",
  children,
  rounded = true,
  objectFit = "cover",
  useAspectRatio = true,
}: MediaCarouselProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({});
  const resizeLoggedRef = useRef(false);

  const canonicalMedia = media ?? [];
  const firstMedia = canonicalMedia[0];

  const aspectRatioValue = useMemo(() => {
    if (!firstMedia) {
      return "1 / 1";
    }
    const width = firstMedia.width || 1;
    const height = firstMedia.height || 1;
    return `${width} / ${height}`;
  }, [firstMedia]);

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" ||
      typeof ResizeObserver === "undefined" ||
      !wrapperRef.current
    ) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      if (resizeLoggedRef.current) {
        console.warn(
          `[MediaCarousel] Height changed for "${ariaLabel}": ${Math.round(
            entry.contentRect.height
          )}px`
        );
      } else {
        resizeLoggedRef.current = true;
      }
    });

    observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, [ariaLabel]);

  const requestSlide = (requestedIndex: number) => {
    const clamped = Math.min(
      canonicalMedia.length - 1,
      Math.max(0, requestedIndex)
    );
    if (clamped !== currentIndex) {
      onChange(clamped);
    }
  };

  const handleNext = () => requestSlide(currentIndex + 1);
  const handlePrevious = () => requestSlide(currentIndex - 1);

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStart(event.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      return;
    }

    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= MIN_SWIPE_DISTANCE) {
      if (distance > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleImageLoad = (url: string) => {
    setLoadedMap((prev) =>
      prev[url]
        ? prev
        : {
            ...prev,
            [url]: true,
          }
    );
  };

  const handleImageError = (url: string) => {
    setErrorMap((prev) =>
      prev[url]
        ? prev
        : {
            ...prev,
            [url]: true,
          }
    );
  };

  const srStatus =
    canonicalMedia.length > 1
      ? `Showing media ${currentIndex + 1} of ${canonicalMedia.length}`
      : "Showing media";

  if (!canonicalMedia.length) {
    return (
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-2xl bg-[#f5f5f5]",
          className
        )}
        style={{ aspectRatio: "1 / 1" }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#909090]">
          Media unavailable
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("relative w-full", className)}>
      <div
        ref={wrapperRef}
        className={clsx(
          "relative w-full overflow-hidden bg-black/5 cursor-default",
          rounded ? "rounded-2xl" : "rounded-none",
          !useAspectRatio && "h-full"
        )}
        style={useAspectRatio ? { aspectRatio: aspectRatioValue } : undefined}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        onDoubleClick={onDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0">
          <div
            className="flex h-full w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {canonicalMedia.map((item, index) => {
              const isCurrent = index === currentIndex;
              const isAdjacent = Math.abs(index - currentIndex) <= 1;
              const imageIsLoaded = Boolean(loadedMap[item.url]);
              const hasError = Boolean(errorMap[item.url]);

              return (
                <div key={`${item.url}-${index}`} className="relative h-full min-w-full">
                  {!imageIsLoaded && !hasError && (
                    <div
                      className={clsx(
                        "absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300",
                        rounded ? "rounded-2xl" : "rounded-none"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {hasError ? (
                    <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-[#909090]">
                      Unable to load media
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={`Slide ${index + 1}`}
                      fill
                      className={clsx(
                        "transition-opacity duration-300",
                        objectFit === "contain" ? "object-contain" : "object-cover",
                        imageIsLoaded ? "opacity-100" : "opacity-0"
                      )}
                      priority={isCurrent || isAdjacent}
                      loading={isCurrent || isAdjacent ? "eager" : "lazy"}
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 630px"
                      onLoad={() => handleImageLoad(item.url)}
                      onError={() => handleImageError(item.url)}
                      draggable={false}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {showControls && canonicalMedia.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#262626] shadow-md transition hover:bg-white"
                  aria-label="Previous media"
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="#262626"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              {currentIndex < canonicalMedia.length - 1 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#262626] shadow-md transition hover:bg-white"
                  aria-label="Next media"
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#262626"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </>
          )}

          {showIndicators && canonicalMedia.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {canonicalMedia.map((_, index) => (
                <button
                  key={`indicator-${index}`}
                  type="button"
                  aria-label={`Go to media ${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    requestSlide(index);
                  }}
                  className={clsx(
                    "h-1.5 w-1.5 rounded-full transition",
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}

          {children}
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {srStatus}
      </span>
    </div>
  );
}
