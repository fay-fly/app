"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import axios from "axios";

type SubscribeButtonProps = {
  subscribingId: number;
  isSubscribed: boolean;
  onSuccess: () => void;
};

export default function SubscribeButton({
  subscribingId,
  isSubscribed,
  onSuccess,
}: SubscribeButtonProps) {
  const [hasSubscribeState, setHasSubscribeState] = useState(isSubscribed);

  useEffect(() => {
    setHasSubscribeState(isSubscribed);
  }, [isSubscribed]);

  const handleFollow = async () => {
    const newSubscribeState = !hasSubscribeState;
    setHasSubscribeState(newSubscribeState);
    await axios.post("/api/users/subscribe", { followingId: subscribingId });
    onSuccess();
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
