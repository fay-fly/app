import FireOutline from "@/icons/FireOutline";
import axios from "axios";
import clsx from "clsx";
import { useState, forwardRef, useImperativeHandle } from "react";
import FireFilled from "@/icons/FireFilled";
import { useSafeSession } from "@/hooks/useSafeSession";
import AuthRequiredModal from "@/components/AuthRequiredModal";

type LikeButtonProps = {
  likesCount: number;
  postId: number;
  likedByMe: boolean;
};

export type LikeButtonRef = {
  triggerLike: () => void;
};

const LikeButton = forwardRef<LikeButtonRef, LikeButtonProps>(
  ({ likesCount, postId, likedByMe }, ref) => {
    const { session } = useSafeSession();
    const [count, setCount] = useState(likesCount);
    const [hasLikedByMe, setHasLikedByMe] = useState(likedByMe);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const onClick = async () => {
      if (!session) {
        setShowAuthModal(true);
        return;
      }

      const newLiked = !hasLikedByMe;
      setHasLikedByMe(newLiked);
      setCount((prevCount) => (newLiked ? prevCount + 1 : prevCount - 1));
      await axios.post("/api/posts/like", {
        postId,
      });
    };

    useImperativeHandle(ref, () => ({
      triggerLike: () => {
        if (!hasLikedByMe) {
          onClick();
        }
      },
    }));

    return (
      <>
        <div
          className={clsx(
            "flex gap-[4px] m-[8px] items-center cursor-pointer",
            hasLikedByMe ? "text-[#F458A3]" : "text-[#A0A0A0]"
          )}
          onClick={onClick}
        >
          {hasLikedByMe ? <FireFilled /> : <FireOutline />}
          {count}
        </div>
        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          action="like this post"
        />
      </>
    );
  }
);

LikeButton.displayName = "LikeButton";

export default LikeButton;