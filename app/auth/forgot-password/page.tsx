"use client";
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import Link from "next/link";
import BackArrow from "@/icons/BackArrow";
import {FormEvent, useState} from "react";
import axios from "axios";
import clsx from "clsx";

export default function ForgotPassword() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState<string>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await axios.post("/api/auth/forgot-password", { email })
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form className="flex flex-col max-w-[424px] w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
          Reset Password
        </h1>
      </div>
      <div className="mt-[90px]">
        <p className="text-[14px] text-(--fly-text-secondary)">
          Enter your email and we’ll send you password reset link.
        </p>
        <FormInput
          label="Email"
          placeholder="john@fayfly.com"
          className="mt-[32px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          isProcessing={isProcessing}
          type="submit"
          className={clsx(
            "mt-[32px] pointer",
            "disabled:bg-(--ply-primary-disabled) disabled:text-(--fly-text-white-disabled)",
            "bg-(--fly-primary) text-(--fly-white)"
          )}
        >
          Request link
        </Button>
        <Link href="/auth/login" className="flex mt-[120px]">
          <BackArrow />
          Back
        </Link>
      </div>
    </form>
  );
}
