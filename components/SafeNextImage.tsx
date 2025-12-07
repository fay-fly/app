import { useState } from "react";
import Image from "next/image";
import ImageError from "@/components/ImageError";

type SafeNextImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  errorSize?: "small" | "medium" | "large";
  showErrorText?: boolean;
};

export default function SafeNextImage({
  src,
  alt,
  className,
  width = 1,
  height = 1,
  unoptimized = true,
  onLoad,
  onError,
  errorSize = "medium",
  showErrorText = true,
}: SafeNextImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    return <ImageError size={errorSize} showText={showErrorText} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      unoptimized={unoptimized}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}
