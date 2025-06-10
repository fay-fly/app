import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export type Option = {
  label: string;
  value: string;
};

type FormSelectProps = InputHTMLAttributes<HTMLSelectElement> & {
  data: Option[];
  label: string;
};

export default function FormSelect({
  label,
  data,
  className,
  ...props
}: FormSelectProps) {
  return (
    <label className={clsx("flex flex-col", className)}>
      <span className="font-semibold text-[14px] text-(--fly-text-primary)">
        {label}
      </span>
      <select
        className="bg-(--fly-white) placeholder-[--fly-input-placeholder-color] border-[1.5px] border-solid border-(--fly-border-color) px-[16px] h-[48px] rounded-[12px]"
        {...props}
      >
        {data.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
