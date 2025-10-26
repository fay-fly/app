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
};

export default function PinButton({
  pinsCount,
  postId,
  pinnedByMe,
}: PinButtonProps) {
  const { session } = useSafeSession();
  const [count, setCount] = useState(pinsCount);
  const [hasPinnedByMe, setHasPinnedByMe] = useState(pinnedByMe);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const onClick = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    const newPin = !hasPinnedByMe;
    setHasPinnedByMe(newPin);
    setCount((prevCount) => (newPin ? prevCount + 1 : prevCount - 1));
    await axios.post("/api/posts/pin", {
      postId,
    });
  };

  return (
    <>
      <div
        className={clsx(
          "flex gap-[4px] m-[8px] items-center cursor-pointer",
          hasPinnedByMe ? "text-[#7C89FF]" : "text-[#A0A0A0]"
        )}
        onClick={onClick}
      >
        {hasPinnedByMe ? <PinFilled /> : <PinOutline />}
        {count}
      </div>
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action="pin this post"
      />
    </>
  );
}
