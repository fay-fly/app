import axios from "axios";
import clsx from "clsx";
import { useState, useEffect, useRef, useCallback } from "react";
import PinOutline from "@/icons/PinOutline";
import PinFilled from "@/icons/PinFilled";
import { useSafeSession } from "@/hooks/useSafeSession";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { useHomePostsStore } from "@/store/homePostsStore";
import { useDiscoverPostsStore } from "@/store/discoverPostsStore";
import { handleError } from "@/utils/errors";

type PinButtonProps = {
  pinsCount: number;
  postId: number;
  pinnedByMe: boolean;
  disabled?: boolean;
};

const DEBOUNCE_MS = 300;

export default function PinButton({
  pinsCount,
  postId,
  pinnedByMe,
  disabled = false,
}: PinButtonProps) {
  const { session } = useSafeSession();
  const updateHomePost = useHomePostsStore((state) => state.updatePost);
  const updateDiscoverPost = useDiscoverPostsStore((state) => state.updatePost);

  // UI state
  const [count, setCount] = useState(pinsCount);
  const [hasPinnedByMe, setHasPinnedByMe] = useState(pinnedByMe);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Server state reference (what we last confirmed from server)
  const serverStateRef = useRef({ pinned: pinnedByMe, count: pinsCount });

  // Pending/desired state after all clicks (null = no pending changes)
  const pendingPinnedRef = useRef<boolean | null>(null);

  // Debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AbortController for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track post ID changes
  const prevPostIdRef = useRef(postId);

  // Track current postId for API response validation
  const currentPostIdRef = useRef(postId);

  const syncStores = useCallback(
    (nextPinsCount: number, nextPinnedByMe: boolean) => {
      updateHomePost(postId, {
        pinsCount: nextPinsCount,
        pinnedByMe: nextPinnedByMe,
      });
      updateDiscoverPost(postId, {
        pinsCount: nextPinsCount,
        pinnedByMe: nextPinnedByMe,
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
      pendingPinnedRef.current = null;
      prevPostIdRef.current = postId;
    }

    // Update current postId ref for API response validation
    currentPostIdRef.current = postId;

    // Update server state reference and UI
    serverStateRef.current = { pinned: pinnedByMe, count: pinsCount };
    setCount(pinsCount);
    setHasPinnedByMe(pinnedByMe);
  }, [pinsCount, pinnedByMe, postId]);

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

    if (disabled) {
      return;
    }

    // Calculate new desired state based on current displayed state
    const currentDisplayed = pendingPinnedRef.current ?? hasPinnedByMe;
    const newDesiredState = !currentDisplayed;
    pendingPinnedRef.current = newDesiredState;

    // Immediately update UI (optimistic)
    setHasPinnedByMe(newDesiredState);

    // Calculate count based on server state + delta
    const delta = newDesiredState === serverStateRef.current.pinned ? 0 : (newDesiredState ? 1 : -1);
    const newCount = Math.max(0, serverStateRef.current.count + delta);
    setCount(newCount);
    syncStores(newCount, newDesiredState);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      const desiredState = pendingPinnedRef.current;
      const targetPostId = currentPostIdRef.current;

      // If desired state matches server state, no API call needed
      if (desiredState === null || desiredState === serverStateRef.current.pinned) {
        pendingPinnedRef.current = null;
        return;
      }

      // Cancel any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.post(
          "/api/posts/pin",
          { postId: targetPostId },
          { signal: abortControllerRef.current.signal }
        );

        // Validate response is for current post and user hasn't clicked again
        if (currentPostIdRef.current !== targetPostId) {
          return; // Post changed, ignore response
        }

        if (pendingPinnedRef.current !== desiredState) {
          // User clicked again during API call - let the next debounce handle it
          // But still update server state reference since the API call succeeded
          serverStateRef.current = {
            pinned: desiredState,
            count: response.data.pinsCount,
          };
          return;
        }

        // Update server state reference (API toggled to desiredState)
        serverStateRef.current = {
          pinned: desiredState,
          count: response.data.pinsCount,
        };

        setCount(response.data.pinsCount);
        setHasPinnedByMe(desiredState);
        syncStores(response.data.pinsCount, desiredState);
        pendingPinnedRef.current = null;
      } catch (error) {
        // Ignore aborted requests
        if (axios.isCancel(error)) {
          return;
        }

        // Show error to user (e.g., "You cannot pin your own post")
        handleError(error);

        // Revert to server state on error
        setHasPinnedByMe(serverStateRef.current.pinned);
        setCount(serverStateRef.current.count);
        syncStores(serverStateRef.current.count, serverStateRef.current.pinned);
        pendingPinnedRef.current = null;
      }
    }, DEBOUNCE_MS);
  }, [session, disabled, hasPinnedByMe, syncStores]);

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
        onClick={onClick}
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
