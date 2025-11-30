import UserMenu from "@/app/(public)/components/UserMenu";
import DiscoverSearchInput from "@/app/(public)/components/DiscoverSearchInput";

export function MainDesktopHeader() {
  return (
    <div className="hidden md:flex border-b border-gray-200 bg-(--fly-white)">
      <div className="mx-auto w-full px-[32px] py-[12px]">
        <div className="grid w-full grid-cols-[1fr_minmax(0,640px)_1fr] items-center gap-4">
          <div />
          <div className="flex justify-center">
            <DiscoverSearchInput variant="desktop" wrapperClassName="w-full max-w-[630px]" />
          </div>
          <div className="flex justify-end">
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
