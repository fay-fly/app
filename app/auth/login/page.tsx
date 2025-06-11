"use client";
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Link from "next/link";
import Button from "@/components/Button";
import GoogleLogo from "@/icons/GoogleLogo";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { AuthSeparator } from "@/app/auth/login/components/AuthSeparator";
import { showToast } from "@/utils/toastify";
import { useRouter } from "next/navigation";

type LoginDetails = {
  identifier: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginDetails, setLoginDetails] = useState<LoginDetails>({
    identifier: "",
    password: "",
  });

  const onChange = <T extends keyof LoginDetails>(
    label: T,
    value: LoginDetails[T]
  ) => {
    setLoginDetails((prev) => {
      const update = { ...prev };
      update[label] = value;
      return update;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const res = await signIn("credentials", {
        redirect: false,
        identifier: loginDetails.identifier,
        password: loginDetails.password,
      });
      if (res?.ok) {
        await router.push("/");
      } else if (res?.error) {
        showToast("error", res.error);
      }
    } catch {
      showToast("error", "Connection error");
    } finally {
      setIsProcessing(false);
    }
  };

  const signInWithGoogle = async () => {
    await signIn("google");
  };

  return (
    <form
      className="flex flex-col max-w-[424px] w-full"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[24px] font-bold">
          Welcome back!
        </h1>
      </div>
      <div className="my-[64px]">
        <Button
          type="button"
          onClick={() => signInWithGoogle()}
          className="bg-(--fly-white) text-(--fly-text-secondary) font-normal cursor-pointer"
        >
          <GoogleLogo />
          Continue with Google
        </Button>
        <AuthSeparator />
        <div className="mt-[32px]">
          <div className="flex flex-col gap-[16px]">
            <FormInput
              label="Email or username"
              placeholder="Enter your email or username"
              required
              value={loginDetails.identifier}
              onChange={(e) => onChange("identifier", e.target.value)}
            />
            <FormInput
              type="password"
              label="Password"
              placeholder="Enter your password"
              required
              value={loginDetails.password}
              onChange={(e) => onChange("password", e.target.value)}
            />
          </div>
          <Link
            href="/auth/forgot-password"
            className="flex justify-end text-(--fly-primary) underline mt-[8px] text-[14px]"
          >
            Forgot password?
          </Link>
          <Button
            type="submit"
            isProcessing={isProcessing}
            className="mt-[32px] bg-(--fly-primary) text-(--fly-white)"
          >
            Log in
          </Button>
        </div>
      </div>
      <p className="flex justify-center gap-[4px] text-[14px]">
        Don&apos;t have an account yet?{" "}
        <Link href="/auth/register" className="text-(--fly-primary) underline">
          Register
        </Link>
      </p>
    </form>
  );
}
