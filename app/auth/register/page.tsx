"use client";
import { useState } from "react";
import RegisterForm from "@/app/auth/register/components/RegistrationForm";
import EmailVerificationForm from "@/app/auth/register/components/EmailVerificationForm";

export type LoginDetails = {
  identifier: string;
  password: string;
};

export default function Register() {
  const [loginDetails, setLoginDetails] = useState<LoginDetails>();

  const onRegistrationSuccessAction = (value: LoginDetails) => {
    setLoginDetails(value);
  };

  return !loginDetails ? (
    <RegisterForm onRegistrationSuccessAction={onRegistrationSuccessAction} />
  ) : (
    <EmailVerificationForm login={loginDetails} />
  );
}
