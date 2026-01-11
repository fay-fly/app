import FireOutline from "@/icons/FireOutline";
import axios from "axios";
import clsx from "clsx";
import { useState, forwardRef, useImperativeHandle, useEffect, useRef, useCallback } from "react";
import FireFilled from "@/icons/FireFilled";
import { useSafeSession } from "@/hooks/useSafeSession";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { useHomePostsStore } from "@/store/homePostsStore";
import { useDiscoverPostsStore } from "@/store/discoverPostsStore";
import { handleError } from "@/utils/errors";

type LikeButtonProps = {
  likesCount: number;
  postId: number;
  likedByMe: boolean;
};

export type LikeButtonRef = {
  triggerLike: () => void;
};

const DEBOUNCE_MS = 300;

const LikeButton = forwardRef<LikeButtonRef, LikeButtonProps>(
  ({ likesCount, postId, likedByMe }, ref) => {
    const { session } = useSafeSession();
    const updateHomePost = useHomePostsStore((state) => state.updatePost);
    const updateDiscoverPost = useDiscoverPostsStore((state) => state.updatePost);

    // UI state
    const [count, setCount] = useState(likesCount);
    const [hasLikedByMe, setHasLikedByMe] = useState(likedByMe);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Server state reference (what we last confirmed from server)
    const serverStateRef = useRef({ liked: likedByMe, count: likesCount });

    // Pending/desired state after all clicks (null = no pending changes)
    const pendingLikedRef = useRef<boolean | null>(null);

    // Debounce timer
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // AbortController for cancelling in-flight requests
    const abortControllerRef = useRef<AbortController | null>(null);

    // Track post ID changes
    const prevPostIdRef = useRef(postId);

    // Track current postId for API response validation
    const currentPostIdRef = useRef(postId);

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

    // Sync with props when they change (e.g., post navigation in modal)
    useEffect(() => {
      // Clear any pending operations when post changes
      if (prevPostIdRef.current !== postId) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        // Cancel any in-flight API requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        pendingLikedRef.current = null;
        prevPostIdRef.current = postId;
      }

      // Update current postId ref for API response validation
      currentPostIdRef.current = postId;

      // Update server state reference and UI
      serverStateRef.current = { liked: likedByMe, count: likesCount };
      setCount(likesCount);
      setHasLikedByMe(likedByMe);
    }, [likesCount, likedByMe, postId]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    const onClick = useCallback(() => {
      if (!session) {
        setShowAuthModal(true);
        return;
      }

      // Calculate new desired state based on current displayed state
      const currentDisplayed = pendingLikedRef.current ?? hasLikedByMe;
      const newDesiredState = !currentDisplayed;
      pendingLikedRef.current = newDesiredState;

      // Immediately update UI (optimistic)
      setHasLikedByMe(newDesiredState);

      // Calculate count based on server state + delta
      const delta = newDesiredState === serverStateRef.current.liked ? 0 : (newDesiredState ? 1 : -1);
      const newCount = Math.max(0, serverStateRef.current.count + delta);
      setCount(newCount);
      syncStores(newCount, newDesiredState);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(async () => {
        const desiredState = pendingLikedRef.current;
        const targetPostId = currentPostIdRef.current;

        // If desired state matches server state, no API call needed
        if (desiredState === null || desiredState === serverStateRef.current.liked) {
          pendingLikedRef.current = null;
          return;
        }

        // Cancel any previous in-flight request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
          const response = await axios.post(
            "/api/posts/like",
            { postId: targetPostId },
            { signal: abortControllerRef.current.signal }
          );

          // Validate response is for current post and user hasn't clicked again
          if (currentPostIdRef.current !== targetPostId) {
            return; // Post changed, ignore response
          }

          if (pendingLikedRef.current !== desiredState) {
            // User clicked again during API call - let the next debounce handle it
            // But still update server state reference since the API call succeeded
            serverStateRef.current = {
              liked: desiredState,
              count: response.data.likesCount,
            };
            return;
          }

          // Update server state reference (API toggled to desiredState)
          serverStateRef.current = {
            liked: desiredState,
            count: response.data.likesCount,
          };

          setCount(response.data.likesCount);
          setHasLikedByMe(desiredState);
          syncStores(response.data.likesCount, desiredState);
          pendingLikedRef.current = null;
        } catch (error) {
          // Ignore aborted requests
          if (axios.isCancel(error)) {
            return;
          }

          // Show error to user
          handleError(error);

          // Revert to server state on error
          setHasLikedByMe(serverStateRef.current.liked);
          setCount(serverStateRef.current.count);
          syncStores(serverStateRef.current.count, serverStateRef.current.liked);
          pendingLikedRef.current = null;
        }
      }, DEBOUNCE_MS);
    }, [session, hasLikedByMe, syncStores]);

    useImperativeHandle(ref, () => ({
      triggerLike: () => {
        // Only trigger if not already liked (for double-click to like feature)
        const currentDisplayed = pendingLikedRef.current ?? hasLikedByMe;
        if (!currentDisplayed) {
          onClick();
        }
      },
    }));

    return (
      <>
        <div
          className={clsx(
            "flex items-center justify-center gap-[4px] h-[40px] p-[8px] cursor-pointer select-none",
            hasLikedByMe ? "text-[#F458A3]" : "text-[#a0a0a0]"
          )}
          onClick={onClick}
        >
          {hasLikedByMe ? <FireFilled /> : <FireOutline />}
          <span className="text-[14px] font-medium tracking-[-0.42px] leading-[22px]">{count}</span>
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
