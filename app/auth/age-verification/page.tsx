"use client";
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import {FormEvent} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";

export default function AgeVerification() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await axios.post("/api/auth/set-birth-date", { birthDate: new Date() });
    router.push("/choose-username")
  };

  return (
    <form className="flex flex-col max-w-[424px] w-full" onChange={handleSubmit}>
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
          Age verification
        </h1>
      </div>
      <div className="mt-[90px]">
        <p className="text-[14px] text-(--fly-text-secondary)">
          Please, enter your date of birth.
        </p>
        <FormInput
          label="Birth date"
          type="date"
          className="mt-[32px]"
        />
        <Button
          type="submit"
          className="mt-[32px] bg-(--ply-primary-disabled) text-(--fly-text-white-disabled) pointer"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
