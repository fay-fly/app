type ImageErrorProps = {
  size?: "small" | "medium" | "large";
  showText?: boolean;
};

export default function ImageError({ size = "medium", showText = true }: ImageErrorProps) {
  const iconSizes = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const textSizes = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const iconSize = iconSizes[size];
  const textSize = textSizes[size];

  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-100">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        {showText && <span className={textSize}>Image unavailable</span>}
      </div>
    </div>
  );
}