'use client';
import { Prisma } from '@prisma/client'
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Link from "next/link";
import Button from "@/components/Button";
import GoogleLogo from "@/icons/GoogleLogo";
import FormSelect from "@/components/FormSelect";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import axios from "axios";
import clsx from "clsx";

export default function Register() {
  const router = useRouter();
  const [registrationPayload, setRegistrationPayload] = useState<Partial<Prisma.UserCreateInput>>({
    email: "",
    username: "",
    birthDate: "",
    gender: "",
    password: "",
  })

  const handleChange = <T extends keyof Prisma.UserCreateInput>(label: T, value: Prisma.UserCreateInput[T]) => {
    setRegistrationPayload(prev => {
      const update = { ...prev };
      update[label] = value;
      return update;
    });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    axios.post("/api/register", registrationPayload)
      .then(() => router.push('/auth/login'));
  };

  const readyToSubmit = Object.values(registrationPayload).filter(v => v).length === Object.keys(registrationPayload).length;

  return (
    <form className="flex flex-col max-w-[424px] w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[24px] font-bold text-center max-w-[350px]">
          Sign up to view your friends&apos; <span className="text-(--fly-link)">photos</span> and <span className="text-(--fly-primary)">videos</span>
        </h1>
      </div>
      <div className="mt-[56px]">
        <div className="flex flex-col gap-[16px]">
          <FormInput label="Email" placeholder="Enter your email" onChange={(e) => handleChange("email", e.target.value)} />
          <div className="flex gap-[24px] justify-between">
            <FormInput type="date" label="Birth date" className="flex-1" onChange={(e) => handleChange("birthDate", e.target.value)} />
            <FormSelect label="Gender" data={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]} className="flex-1" onChange={(e) => handleChange("gender", e.target.value)} />
          </div>
          <FormInput label="Username" placeholder="Enter your username" onChange={(e) => handleChange("username", e.target.value)} />
          <p className="mt-[32px] text-[14px] text-(--fly-text-secondary)">
            Make sure your new password is strong - use 8 characters, including letters and numbers.
          </p>
          <FormInput type="password" label="Password" placeholder="Create password" onChange={(e) => handleChange("password", e.target.value)} />
          <FormInput type="password" label="Repeat password" placeholder="Repeat password" />
          <label className="flex gap-[8px] text-[12px]">
            <input type="checkbox"/>
            <p>
              By continuing, you accept our
              <Link href="/privacy-policy" className="text-(--fly-primary) underline">Privacy Policy</Link> and
              <Link href="/terms-of-use" className="text-(--fly-primary) underline">Terms of Use</Link>
            </p>
          </label>
        </div>
        <Button
          type="submit"
          className={clsx(
            "mt-[32px] pointer",
            !readyToSubmit
              ? "bg-(--ply-primary-disabled) text-(--fly-text-white-disabled)"
              : "bg-(--fly-primary) text-(--fly-white)"
          )}
          disabled={!readyToSubmit}
        >
          Sign up
        </Button>
      </div>
      <div className={clsx(
        "mt-[32px] py-3 flex items-center text-xs text-(--fly-text-primary)",
        "uppercase before:flex-1 before:border-t before:border-(--fly-text-primary)",
        "before:me-6 after:flex-1 after:border-t after:border-(--fly-text-primary)",
        "after:ms-6 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600"
      )}>
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
        <Link href="/auth/login" className="text-(--fly-primary) underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
