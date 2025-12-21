import FireOutline from "@/icons/FireOutline";
import axios from "axios";
import clsx from "clsx";
import { useState, forwardRef, useImperativeHandle, useEffect, useRef, useCallback } from "react";
import FireFilled from "@/icons/FireFilled";
import { useSafeSession } from "@/hooks/useSafeSession";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { useHomePostsStore } from "@/store/homePostsStore";
import { useDiscoverPostsStore } from "@/store/discoverPostsStore";

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
    const updateHomePost = useHomePostsStore((state) => state.updatePost);
    const updateDiscoverPost = useDiscoverPostsStore((state) => state.updatePost);
    const [count, setCount] = useState(likesCount);
    const [hasLikedByMe, setHasLikedByMe] = useState(likedByMe);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const isProcessingRef = useRef(false);
    const prevPostIdRef = useRef(postId);

    const syncStores = useCallback(
      (nextLikesCount: number, nextLikedByMe: boolean) => {
        updateHomePost(postId, {
          likesCount: nextLikesCount,
          likedByMe: nextLikedByMe,
        });
        updateDiscoverPost(postId, {
          likesCount: nextLikesCount,
          likedByMe: nextLikedByMe,
        });
      },
      [postId, updateHomePost, updateDiscoverPost]
    );

    useEffect(() => {
      if (prevPostIdRef.current !== postId) {
        setCount(likesCount);
        setHasLikedByMe(likedByMe);
        prevPostIdRef.current = postId;
      } else {
        setCount(likesCount);
        setHasLikedByMe(likedByMe);
      }
    }, [likesCount, likedByMe, postId]);

    const onClick = async () => {
      if (!session) {
        setShowAuthModal(true);
        return;
      }

      if (isProcessing || isProcessingRef.current) {
        return;
      }

      setIsProcessing(true);
      isProcessingRef.current = true;
      const previousCount = count;
      const previousLikedState = hasLikedByMe;
      const newLiked = !previousLikedState;
      const optimisticCount = newLiked
        ? previousCount + 1
        : Math.max(previousCount - 1, 0);

      setHasLikedByMe(newLiked);
      setCount(optimisticCount);
      syncStores(optimisticCount, newLiked);

      try {
        const response = await axios.post("/api/posts/like", {
          postId,
        });

        if (response.data?.likesCount !== undefined && typeof response.data.likesCount === "number") {
          setCount(response.data.likesCount);
          setHasLikedByMe(newLiked);
          syncStores(response.data.likesCount, newLiked);
        } else {
          setHasLikedByMe(previousLikedState);
          setCount(previousCount);
          syncStores(previousCount, previousLikedState);
        }
      } catch (error) {
        setHasLikedByMe(previousLikedState);
        setCount(previousCount);
        syncStores(previousCount, previousLikedState);
      } finally {
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
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
            "flex gap-[4px] m-[8px] items-center cursor-pointer select-none",
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
