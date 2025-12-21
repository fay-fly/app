"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Button from "@/components/Button";
import axios from "axios";

type SubscribeButtonProps = {
  subscribingId: number;
  isSubscribed: boolean;
  onSuccess: (isSubscribed: boolean) => void;
};

export default function SubscribeButton({
  subscribingId,
  isSubscribed,
  onSuccess,
}: SubscribeButtonProps) {
  const [hasSubscribeState, setHasSubscribeState] = useState(isSubscribed);
  const isProcessingRef = useRef(false);
  const pendingTogglesRef = useRef(0);
  const lastServerStateRef = useRef(isSubscribed);

  useEffect(() => {
    setHasSubscribeState(isSubscribed);
    lastServerStateRef.current = isSubscribed;
    pendingTogglesRef.current = 0;
  }, [isSubscribed]);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;

    try {
      while (pendingTogglesRef.current > 0) {
        pendingTogglesRef.current -= 1;
        const response = await axios.post("/api/users/subscribe", {
          followingId: subscribingId,
        });
        const nextState =
          typeof response.data?.isSubscribed === "boolean"
            ? response.data.isSubscribed
            : !lastServerStateRef.current;
        lastServerStateRef.current = nextState;
        setHasSubscribeState(nextState);
        onSuccess(nextState);
      }
    } catch (error) {
      pendingTogglesRef.current = 0;
      setHasSubscribeState(lastServerStateRef.current);
    } finally {
      isProcessingRef.current = false;
      if (pendingTogglesRef.current > 0) {
        processQueue();
      }
    }
  }, [onSuccess, subscribingId]);

  const handleFollow = () => {
    pendingTogglesRef.current += 1;
    setHasSubscribeState((prev) => !prev);
    processQueue();
  };

  return (
    <Button
      onClick={handleFollow}
      type="button"
      className="bg-(--fly-primary) text-(--fly-white) px-[12px] py-[5px] h-[32px] text-[14px] max-w-[100px]"
    >
      {hasSubscribeState ? "Unsub" : "Subscribe"}
    </Button>
  );
}
