import Logo from "@/icons/Logo";
import FormLabel from "@/components/FormLabel";
import Button from "@/components/Button";
import Link from "next/link";
import BackArrow from "@/icons/BackArrow";

export default function ForgotPassword() {
  return (
    <form className="flex flex-col max-w-[424px] w-full">
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
          Reset Password
        </h1>
      </div>
      <div className="mt-[90px]">
        <p className="text-[14px] text-(--fly-text-secondary)">
          Enter your email and we’ll send you password reset link
        </p>
        <FormLabel
          label="Email"
          placeholder="john@fayfly.com"
          className="mt-[32px]"
        />
        <Button
          type="submit"
          className="mt-[32px] bg-(--ply-primary-disabled) text-(--fly-text-white-disabled) pointer"
        >
          Request link
        </Button>
        <Link href="/" className="flex mt-[120px]">
          <BackArrow />
          Back
        </Link>
      </div>
    </form>
  );
}
