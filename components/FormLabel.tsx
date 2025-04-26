import { InputHTMLAttributes } from "react";
import clsx from "clsx";

type FormLabelProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function FormLabel({
  label,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label className={clsx("flex flex-col", className)}>
      <span className="font-semibold text-[14px] text-(--fly-text-primary)">
        {label}
      </span>
      <input
        className="bg-(--fly-white) placeholder-[--fly-input-placeholder-color] border-[1.5px] border-solid border-(--fly-border-color) px-[16px] h-[48px] rounded-[12px]"
        {...props}
      />
    </label>
  );
}
