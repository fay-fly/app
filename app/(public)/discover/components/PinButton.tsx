import axios from "axios";
import clsx from "clsx";
import { useState } from "react";
import PinOutline from "@/icons/PinOutline";
import PinFilled from "@/icons/PinFilled";
import { useSafeSession } from "@/hooks/useSafeSession";
import AuthRequiredModal from "@/components/AuthRequiredModal";

type PinButtonProps = {
  pinsCount: number;
  postId: number;
  pinnedByMe: boolean;
  disabled?: boolean;
};

export default function PinButton({
  pinsCount,
  postId,
  pinnedByMe,
  disabled = false,
}: PinButtonProps) {
  const { session } = useSafeSession();
  const [count, setCount] = useState(pinsCount);
  const [hasPinnedByMe, setHasPinnedByMe] = useState(pinnedByMe);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const onClick = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    const newPin = !hasPinnedByMe;
    setHasPinnedByMe(newPin);
    setCount((prevCount) => (newPin ? prevCount + 1 : prevCount - 1));

    try {
      const response = await axios.post("/api/posts/pin", {
        postId,
      });

      if (response.data.pinsCount !== undefined) {
        setCount(response.data.pinsCount);
      }
    } catch (error) {
      setHasPinnedByMe(!newPin);
      setCount((prevCount) => (newPin ? prevCount - 1 : prevCount + 1));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className={clsx(
          "flex items-center justify-center gap-[4px] h-[40px] p-[8px] select-none transition-opacity",
          disabled
            ? "text-[#D0D0D0] cursor-not-allowed opacity-60"
            : hasPinnedByMe
              ? "text-[#7C89FF] cursor-pointer"
              : "text-[#a0a0a0] cursor-pointer"
        )}
        onClick={disabled ? undefined : onClick}
      >
        {hasPinnedByMe ? <PinFilled /> : <PinOutline />}
        <span className="text-[14px] font-medium tracking-[-0.42px] leading-[22px]">{count}</span>
      </div>
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action="pin this post"
      />
    </>
  );
}
