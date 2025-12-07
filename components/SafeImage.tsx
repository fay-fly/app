import { useState } from "react";
import ImageError from "@/components/ImageError";

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  loading?: "eager" | "lazy";
  errorSize?: "small" | "medium" | "large";
  showErrorText?: boolean;
};

export default function SafeImage({
  src,
  alt,
  className,
  onLoad,
  onError,
  loading,
  errorSize = "medium",
  showErrorText = true,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    return <ImageError size={errorSize} showText={showErrorText} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={handleError}
      loading={loading}
    />
  );
}