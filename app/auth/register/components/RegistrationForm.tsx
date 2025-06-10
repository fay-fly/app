"use client";
import { Prisma } from "@prisma/client";
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Link from "next/link";
import Button from "@/components/Button";
import FormSelect from "@/components/FormSelect";
import { FormEvent, useState } from "react";
import axios from "axios";
import clsx from "clsx";
import { LoginDetails } from "@/app/auth/register/page";

type RegisterFormProps = {
  onRegistrationSuccessAction: (login: LoginDetails) => void;
};

export default function RegisterForm({
  onRegistrationSuccessAction,
}: RegisterFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationPayload, setRegistrationPayload] = useState<
    Partial<Prisma.UserCreateInput>
  >({});

  const handleChange = <T extends keyof Prisma.UserCreateInput>(
    label: T,
    value: Prisma.UserCreateInput[T]
  ) => {
    setRegistrationPayload((prev) => {
      const update = { ...prev };
      update[label] = value;
      return update;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await axios.post("/api/auth/register", registrationPayload);
      onRegistrationSuccessAction({
        email: registrationPayload.email ?? "",
        password: registrationPayload.password ?? "",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <form
        className="flex flex-col max-w-[424px] w-full"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center">
          <Logo />
          <h1 className="mt-[16px] text-(--fly-text-secondary) text-[24px] font-bold text-center max-w-[350px]">
            Creating a new account
          </h1>
        </div>
        <div className="mt-[56px]">
          <div className="flex flex-col gap-[16px]">
            <FormInput
              label="Email"
              placeholder="Enter your email"
              required
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <div className="flex gap-[24px] justify-between">
              <FormInput
                type="date"
                label="Birth date"
                className="flex-1"
                required
                onChange={(e) => handleChange("birthDate", e.target.value)}
              />
              <FormSelect
                label="Gender"
                required
                data={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                className="flex-1"
                onChange={(e) => handleChange("gender", e.target.value)}
              />
            </div>
            <FormInput
              label="Username"
              placeholder="Enter your username"
              required
              onChange={(e) => handleChange("username", e.target.value)}
            />
            <FormInput
              type="password"
              label="Password"
              placeholder="Create password"
              required
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <FormInput
              type="password"
              label="Repeat password"
              placeholder="Repeat password"
              required
            />
          </div>
          <div className="flex flex-col gap-[16px] items-center">
            <Button
              type="submit"
              isProcessing={isProcessing}
              className={clsx(
                "mt-[32px] pointer",
                "disabled:bg-(--ply-primary-disabled) disabled:text-(--fly-text-white-disabled)",
                "bg-(--fly-primary) text-(--fly-white)"
              )}
            >
              Sign up
            </Button>
            <Link
              href="/auth/login"
              className="min-h-[48px] flex items-center justify-center rounded-full w-full text-(--fly-primary) font-semibold"
            >
              Back
            </Link>
          </div>
        </div>
      </form>
      <p className="text-[14px] mt-[64px]">
        By continuing, you accept our{" "}
        <Link href="/privacy-policy" className="text-(--fly-primary) underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms-of-use" className="text-(--fly-primary) underline">
          Terms of Use
        </Link>
      </p>
    </>
  );
}
