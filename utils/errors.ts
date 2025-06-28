import axios from "axios";
import { showToast } from "@/utils/toastify";

export function handleError(error: unknown) {
  let message = "Unexpected error happened";
  if (axios.isAxiosError(error)) {
    if (
      error.response?.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
    ) {
      message = String(error.response.data.message);
    } else if (error.message) {
      message = error.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }
  showToast("error", message);
}
