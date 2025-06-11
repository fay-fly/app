"use client";
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import {handleError} from "@/utils/errors";

function ResetPasswordForm({ token }: { token: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const { data } = await axios.post<{ email: string }>("/api/auth/reset-password", {
          token,
          newPassword: password,
        }
      );
      alert("Password successfully changed!");
      await signIn("credentials", {
        identifier: data.email,
        password: password,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form
      className="flex flex-col max-w-[424px] w-full"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
          Set new password
        </h1>
      </div>
      <div className="mt-[64px]">
        <p className="text-[14px] text-center text-(--fly-text-secondary)">
          Make sure your password is at least 8 characters, with letters and
          numbers.
        </p>
        <FormInput
          type="password"
          label="New Password"
          placeholder="Create new password"
          required
          className="mt-[32px]"
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormInput
          type="password"
          label="Repeat password"
          placeholder="Repaet password"
          required
          className="mt-[24px]"
        />
        <Button
          type="submit"
          className="mt-[32px] bg-(--fly-primary) text-(--fly-white)"
          isProcessing={isProcessing}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}

function VerifyPassword() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const currentToken = searchParams.get("token") ?? ""
    setToken(currentToken);
    axios
      .get(`/api/auth/verify-reset?token=${encodeURIComponent(currentToken)}`)
      .catch(() => {
        setError("Could not verify token.");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, []);

  if (isProcessing) return <p>Checking reset link...</p>;
  if (error) return <p className="text-red-50">{error}</p>;
  return token && <ResetPasswordForm token={token} />;
}

export default function ResetPassword() {
  return (
    <Suspense>
      <VerifyPassword />
    </Suspense>
  );
}
