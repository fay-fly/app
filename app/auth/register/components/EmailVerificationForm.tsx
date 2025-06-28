import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { FormEvent, useState } from "react";
import axios from "axios";
import { signIn } from "next-auth/react";
import { LoginDetails } from "@/app/auth/register/page";
import { handleError } from "@/utils/errors";

type EmailVerificationFormProps = {
  login: LoginDetails;
};

export default function EmailVerificationForm({
  login,
}: EmailVerificationFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await axios.post("/api/auth/verify-email", {
        code: emailVerificationCode,
        email: login.identifier,
      });
      await signIn("credentials", {
        ...login,
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
          Email confirmation
        </h1>
      </div>
      <div className="mt-[90px]">
        <p className="text-[14px] text-(--fly-text-secondary)">
          We sent 4 digits code to your email
        </p>
        <FormInput
          type="number"
          required
          placeholder="0000"
          value={emailVerificationCode}
          className="mt-[32px]"
          onChange={(e) => setEmailVerificationCode(e.target.value)}
        />
        <Button
          type="submit"
          isProcessing={isProcessing}
          className="mt-[32px] bg-(--fly-primary) text-(--fly-white) min-h-[48px]"
        >
          Confirm
        </Button>
      </div>
    </form>
  );
}
