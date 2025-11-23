import UserMenu from "@/app/(public)/components/UserMenu";
import DiscoverSearchInput from "@/app/(public)/components/DiscoverSearchInput";

export function MainDesktopHeader() {
  return (
    <div className="hidden md:flex border-b border-gray-200 bg-(--fly-white)">
      <div className="mx-auto flex w-full max-w-[1000px] items-center gap-6 px-[32px] py-[12px]">
        <div className="flex flex-1 justify-center">
          <DiscoverSearchInput
            variant="desktop"
            wrapperClassName="max-w-[420px] w-full"
          />
        </div>
        <UserMenu />
      </div>
    </div>
  );
}
