import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Link from "next/link";
import Button from "@/components/Button";
import GoogleLogo from "@/icons/GoogleLogo";
import FormSelect from "@/components/FormSelect";

export default function Register() {
  return (
    <form className="flex flex-col max-w-[424px] w-full">
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[24px] font-bold text-center max-w-[350px]">
          Sign up to view your friends&apos; <span className="text-(--fly-link)">photos</span> and <span className="text-(--fly-primary)">videos</span>
        </h1>
      </div>
      <div className="mt-[56px]">
        <div className="flex flex-col gap-[16px]">
          <FormInput label="Email" placeholder="Enter your email" />
          <div className="flex gap-[24px] justify-between">
            <FormInput type="date" label="Birth date" className="flex-1" />
            <FormSelect label="Gender" data={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]} className="flex-1" />
          </div>
          <FormInput label="Username" placeholder="Enter your username" />
          <p className="mt-[32px] text-[14px] text-(--fly-text-secondary)">
            Make sure your new password is strong - use 8 characters, including letters and numbers.
          </p>
          <FormInput type="password" label="Password" placeholder="Create password" />
          <FormInput type="password" label="Repeat password" placeholder="Repeat password" />
          <label className="flex gap-[8px] text-[12px]">
            <input type="checkbox"/>
            <span>By continuing, you accept our <Link href="/privacy-policy" className="text-(--fly-primary) underline">Privacy Policy</Link> and <Link href="/terms-of-use" className="text-(--fly-primary) underline">Terms of Use</Link></span>
          </label>
        </div>
        <Button
          type="submit"
          className="mt-[32px] bg-(--ply-primary-disabled) text-(--fly-text-white-disabled) pointer"
        >
          Sign up
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
        Have an account?{" "}
        <Link href="/public" className="text-(--fly-primary) underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
