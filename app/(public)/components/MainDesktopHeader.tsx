import UserCard from "@/app/(public)/components/UserCard";

export function MainDesktopHeader() {
  return <div className="hidden md:flex justify-end px-[32px] py-[12px] border-b border-gray-200 bg-(--fly-white)">
    <UserCard />
  </div>
}