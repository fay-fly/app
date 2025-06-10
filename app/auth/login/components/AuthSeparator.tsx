import RightSeparator from "@/app/auth/login/components/RightSeparator";
import LeftSeparator from "@/app/auth/login/components/LeftSeparator";

export function AuthSeparator() {
  return (
    <div className="mt-[32px] py-3 flex gap-[16px] items-center justify-center">
      <RightSeparator />
      <span>OR</span>
      <LeftSeparator />
    </div>
  );
}
