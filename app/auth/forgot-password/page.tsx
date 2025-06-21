"use client";
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import Link from "next/link";
import { FormEvent, useState } from "react";
import axios from "axios";
import clsx from "clsx";
import SuccessIcon from "@/icons/SuccessIcon";
import {handleError} from "@/utils/errors";

export default function ForgotPassword() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await axios.post("/api/auth/forgot-password", { email });
      setShowSuccessMessage(true);
    } catch (error) {
      handleError(error)
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      className="flex flex-col max-w-[424px] w-full"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
          Reset Password
        </h1>
      </div>
      <div className="mt-[64px]">
        {showSuccessMessage ? (
          <div className="flex text-(--fly-success) gap-[10px] items-start">
            <SuccessIcon />
            <p className="leading-none">
              Password reset link was successfully sent to your email:{" "}
              <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <FormInput
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex flex-col gap-[16px] items-center">
              <Button
                isProcessing={isProcessing}
                type="submit"
                className={clsx(
                  "mt-[32px] pointer",
                  "disabled:bg-(--ply-primary-disabled) disabled:text-(--fly-text-white-disabled)",
                  "bg-(--fly-primary) text-(--fly-white) min-h-[48px]"
                )}
              >
                Request link
              </Button>
              <Link
                href="/auth/login"
                className="min-h-[48px] flex items-center justify-center rounded-full w-full text-(--fly-primary) font-semibold"
              >
                Back
              </Link>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
