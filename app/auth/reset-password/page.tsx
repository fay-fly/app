'use client';
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import {FormEvent} from "react";

export default function ResetPassword() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="flex flex-col max-w-[424px] w-full" onChange={handleSubmit}>
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
          Reset Password
        </h1>
      </div>
      <div className="mt-[90px]">
        <p className="text-[14px] text-(--fly-text-secondary)">
          Make sure your password is at least 8 characters, with letters and numbers.
        </p>
        <FormInput
          type="password"
          label="New Password"
          placeholder="Create new password"
          required
          className="mt-[32px]"
        />
        <FormInput
          type="password"
          label="Repeat new password"
          placeholder="Repaet password"
          required
          className="mt-[32px]"
        />
        <Button
          type="submit"
          className="mt-[32px] bg-(--fly-primary) text-(--fly-white)"
        >
          Confirm
        </Button>
      </div>
    </form>
  );
}