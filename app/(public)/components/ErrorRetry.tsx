"use client";

type ErrorRetryProps = {
  message: string;
  onRetry: () => void;
};

export default function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  return (
    <div className="py-[32px] px-[16px] flex flex-col items-center gap-[12px]">
      <p className="text-[14px] text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="bg-(--fly-primary) text-(--fly-white) px-[24px] py-[8px] rounded-lg hover:opacity-90 transition-opacity text-[14px] font-semibold"
      >
        Retry
      </button>
    </div>
  );
}