import { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonProps = InputHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  type: "button" | "reset" | "submit";
};

export default function Button({
  children,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={clsx(
        "flex justify-center items-center gap-[12px] rounded-full w-full",
        "min-h-[48px] cursor-pointer disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
