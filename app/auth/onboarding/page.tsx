"use client";
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import {FormEvent, Suspense, useState} from "react";
import axios from "axios";
import {useSearchParams} from "next/navigation";
import {signIn} from "next-auth/react";
import {getAgeFromDob} from "@/utils/dates";

type OnboardingData = {
  username: string | null;
  birthDate: string | null;
}

function OnboardingForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') ?? '';

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    username: `user${userId}`,
    birthDate: null
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (onboardingData.username && onboardingData.birthDate) {
      try {
        setIsProcessing(true);
        await axios.post("/api/auth/onboarding", {
          userId,
          ...onboardingData
        });
        await signIn("google");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleChange = <T extends keyof OnboardingData>(label: T, value: OnboardingData[T]) => {
    setOnboardingData(prev => {
      const update = { ...prev };
      update[label] = value;
      return update;
    });
  }

  const nextStep = () => {
    if (onboardingData.birthDate && getAgeFromDob(onboardingData.birthDate) < 18) {
      alert("To continue you have to be at lease 18 years old.");
      return;
    }
    setStepIndex(1)
  }

  return <form className="flex flex-col max-w-[424px] w-full" onSubmit={handleSubmit}>
    <div className="flex flex-col items-center">
      <Logo/>
    </div>
    {stepIndex === 0 && <div className="mt-[90px]">
      <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
        Age verification
      </h1>
      <p className="text-[14px] text-(--fly-text-secondary)">
        Please, enter your date of birth.
      </p>
      <FormInput
        label="Birth date"
        type="date"
        className="mt-[32px]"
        value={onboardingData.birthDate ?? ""}
        onChange={(e) => handleChange("birthDate", e.target.value)}
      />
      <Button
        type="button"
        onClick={() => nextStep()}
        className="mt-[32px] bg-(--fly-primary) text-(--fly-white)"
      >
          Continue
      </Button>
    </div>}
    {stepIndex === 1 && <div className="mt-[90px]">
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
            Choose username
        </h1>
        <p className="text-[14px] text-(--fly-text-secondary)">
            Please, enter your date of birth.
        </p>
        <FormInput
            label="Username"
            type="text"
            className="mt-[32px]"
            value={onboardingData.username ?? ""}
            onChange={(e) => handleChange("username", e.target.value)}
        />
        <Button
            type="submit"
            isProcessing={isProcessing}
            className="mt-[32px] bg-(--fly-primary) text-(--fly-white)"
        >
            Submit
        </Button>
    </div>}
  </form>;
}

export default function Onboarding() {
  return <Suspense>
    <OnboardingForm/>
  </Suspense>;
}
