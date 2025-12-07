import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning" | "default";

export const showToast = (
  type: ToastType,
  content: string,
  options?: {
    duration?: number;
  }
): string | number => {
  switch (type) {
    case "success":
      return toast.success(content, options);
    case "error":
      return toast.error(content, options);
    case "info":
      return toast.info(content, options);
    case "warning":
      return toast.warning(content, options);
    case "default":
      return toast(content, options);
    default:
      return toast(content, options);
  }
};
