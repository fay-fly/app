import { InputHTMLAttributes, useState } from "react";
import clsx from "clsx";
import EyeOpen from "@/icons/EyeOpen";
import EyeClosed from "@/icons/EyeClosed";

type FormLabelProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function FormInput({
  label,
  className,
  type,
  ...props
}: FormLabelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className={clsx("flex flex-col", className)}>
      {label && (
        <span className="font-semibold text-[14px] text-(--fly-text-primary)">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          className={clsx(
            "w-full bg-(--fly-white) placeholder-[--fly-input-placeholder-color] border-[1.5px] border-solid border-(--fly-border-color) px-[16px] h-[48px] rounded-[12px]",
            isPassword && "pr-[48px]"
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[12px] top-1/2 -translate-y-1/2 p-[4px] text-[#a0a0a0] hover:text-[#5b5b5b] transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeClosed /> : <EyeOpen />}
          </button>
        )}
      </div>
    </label>
  );
}
