"use client";

type NewPostsIndicatorProps = {
  count: number;
  onClick: () => void;
};

export default function NewPostsIndicator({ count, onClick }: NewPostsIndicatorProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-[60px] z-50 flex justify-center py-[8px]">
      <button
        onClick={onClick}
        className="bg-(--fly-primary) text-(--fly-white) px-[20px] py-[8px] rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-[14px] font-semibold"
      >
        {count} new {count === 1 ? "post" : "posts"}
      </button>
    </div>
  );
}