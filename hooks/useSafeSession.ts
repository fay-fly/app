import {useSession} from "next-auth/react";

export function useSafeSession() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return { session, isLoading };
}