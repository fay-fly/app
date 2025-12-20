export default function PostSkeleton() {
  return (
    <div className="mb-[12px] flex flex-col animate-pulse">
      <div className="mb-[8px] flex justify-between px-[16px] py-[8px]">
        <div className="flex items-center gap-[8px]">
          <div className="h-[32px] w-[32px] rounded-full bg-gray-200" />
          <div className="h-[16px] w-[100px] rounded bg-gray-200" />
        </div>
      </div>

      <div className="aspect-square w-full bg-gray-200" />

      <div className="mt-[8px] flex justify-between px-[16px]">
        <div className="flex gap-[16px]">
          <div className="h-[24px] w-[60px] rounded bg-gray-200" />
          <div className="h-[24px] w-[60px] rounded bg-gray-200" />
        </div>
        <div className="h-[24px] w-[60px] rounded bg-gray-200" />
      </div>

      <div className="mt-[8px] px-[16px]">
        <div className="h-[16px] w-full rounded bg-gray-200 mb-[4px]" />
        <div className="h-[16px] w-[70%] rounded bg-gray-200" />
      </div>

      <div className="mt-[4px] px-[16px]">
        <div className="h-[14px] w-[80px] rounded bg-gray-200" />
      </div>
    </div>
  );
}