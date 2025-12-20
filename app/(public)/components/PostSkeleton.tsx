export default function PostSkeleton() {
  return (
    <div className="mb-[12px] flex flex-col">
      <div className="mb-[8px] flex justify-between px-[16px] py-[8px]">
        <div className="flex items-center gap-[8px]">
          <div className="h-[32px] w-[32px] rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          <div className="h-[16px] w-[100px] rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        </div>
      </div>

      <div className="aspect-square w-full bg-gradient-to-br from-gray-200 via-gray-250 to-gray-300 animate-pulse" />

      <div className="mt-[8px] flex justify-between px-[16px]">
        <div className="flex gap-[16px]">
          <div className="h-[24px] w-[60px] rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          <div className="h-[24px] w-[60px] rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        </div>
        <div className="h-[24px] w-[60px] rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
      </div>

      <div className="mt-[8px] px-[16px]">
        <div className="h-[16px] w-full rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse mb-[4px]" />
        <div className="h-[16px] w-[70%] rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
      </div>

      <div className="mt-[4px] px-[16px]">
        <div className="h-[14px] w-[80px] rounded bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
      </div>
    </div>
  );
}