import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Link from "next/link";
import Button from "@/components/Button";
import GoogleLogo from "@/icons/GoogleLogo";

export default function Login() {
  return (
    <form className="flex flex-col max-w-[424px] w-full">
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[24px] font-bold">
          Welcome back!
        </h1>
      </div>
      <div className="mt-[56px]">
        <div className="flex flex-col gap-[16px]">
          <FormInput
            label="Email or username"
            placeholder="Enter your email or username"
          />
          <FormInput
            type="password"
            label="Password"
            placeholder="Enter your password"
          />
        </div>
        <Link
          href="/forgot-password"
          className="flex justify-end text-(--fly-primary) underline mt-[8px] text-[14px]"
        >
          Forgot password?
        </Link>
        <Button
          type="submit"
          className="mt-[32px] bg-(--ply-primary-disabled) text-(--fly-text-white-disabled) pointer"
        >
          Log in
        </Button>
      </div>
      <div className="mt-[32px] py-3 flex items-center text-xs text-(--fly-text-primary) uppercase before:flex-1 before:border-t before:border-(--fly-text-primary) before:me-6 after:flex-1 after:border-t after:border-(--fly-text-primary) after:ms-6 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600">
        Or
      </div>
      <Button
        type="submit"
        className="mt-[32px] bg-(--fly-white) text-(--fly-text-secondary) font-normal cursor-pointer"
      >
        <GoogleLogo />
        Continue with Google
      </Button>
      <p className="mt-[64px] flex justify-center gap-[4px] text-[14px]">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-(--fly-primary) underline">
          Register
        </Link>
      </p>
    </form>
  );
}
