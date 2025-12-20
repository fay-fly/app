"use client";
import Post from "@/app/(public)/components/Post";
import PostSkeleton from "@/app/(public)/components/PostSkeleton";
import NewPostsIndicator from "@/app/(public)/components/NewPostsIndicator";
import ErrorRetry from "@/app/(public)/components/ErrorRetry";
import type { PostWithUser } from "@/types/postWithUser";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import PageLoader from "@/components/PageLoader";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useRouter } from "next/navigation";
import { useHomePostsStore } from "@/store/homePostsStore";

const PAGE_LIMIT = 10;
const NEW_POSTS_CHECK_INTERVAL = 30000;
const PREFETCH_THRESHOLD = 2;

type FeedResponse = {
  posts: PostWithUser[];
  nextCursor: number | null;
  hasMore: boolean;
};

export default function Home() {
  const { session, isLoading: sessionLoading } = useSafeSession();
  const router = useRouter();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const newPostsCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const {
    posts,
    nextCursor,
    hasMore,
    loaded,
    error,
    scrollPosition,
    newPostsCount,
    isLoadingNewPosts,
    isLoadingMore,
    loadingRequestId,
    setPosts,
    appendPosts,
    prependPosts,
    setNextCursor,
    setHasMore,
    setLoaded,
    setError,
    setScrollPosition,
    setNewPostsCount,
    setIsLoadingNewPosts,
    setIsLoadingMore,
    setLoadingRequestId,
    updatePost,
  } = useHomePostsStore();

  const buildEndpoint = useCallback((cursor?: number | null) => {
    const params = new URLSearchParams();
    params.set("limit", PAGE_LIMIT.toString());
    if (cursor !== null && cursor !== undefined) {
      params.set("cursor", cursor.toString());
    }
    return `/api/posts/feed?${params.toString()}`;
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (!session || !hasMore || isLoadingMore || loadingRequestId) {
      return;
    }

    const requestId = Math.random().toString(36);
    setLoadingRequestId(requestId);
    setIsLoadingMore(true);
    setError(null);

    try {
      const endpoint = buildEndpoint(nextCursor);
      const response = await axios.get<FeedResponse>(endpoint);

      appendPosts(response.data.posts);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
    } catch (err) {
      setError("Failed to load more posts");
      console.error(err);
    } finally {
      setIsLoadingMore(false);
      setLoadingRequestId(null);
    }
  }, [
    session,
    hasMore,
    isLoadingMore,
    loadingRequestId,
    nextCursor,
    buildEndpoint,
    appendPosts,
    setNextCursor,
    setHasMore,
    setIsLoadingMore,
    setLoadingRequestId,
    setError,
  ]);

  const fetchInitialPosts = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsInitialLoad(true);
    setError(null);

    try {
      const endpoint = buildEndpoint(null);
      const response = await axios.get<FeedResponse>(endpoint);

      setPosts(response.data.posts);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
      setLoaded(true);
    } catch (err) {
      setError("Failed to load feed");
      console.error(err);
    } finally {
      setIsInitialLoad(false);
    }
  }, [session, buildEndpoint, setPosts, setNextCursor, setHasMore, setLoaded, setError]);

  const checkNewPosts = useCallback(async () => {
    if (!session || posts.length === 0 || isLoadingNewPosts) {
      return;
    }

    const firstPostId = posts[0]?.id;
    if (!firstPostId) return;

    try {
      const response = await axios.get<{ count: number; hasNew: boolean }>(
        `/api/posts/feed/check-new?sinceId=${firstPostId}`
      );

      if (response.data.hasNew) {
        setNewPostsCount(response.data.count);
      }
    } catch (err) {
      console.error("Failed to check for new posts", err);
    }
  }, [session, posts, isLoadingNewPosts, setNewPostsCount]);

  const loadNewPosts = useCallback(async () => {
    if (!session || isLoadingNewPosts) {
      return;
    }

    setIsLoadingNewPosts(true);
    setError(null);

    try {
      const endpoint = buildEndpoint(null);
      const response = await axios.get<FeedResponse>(endpoint);

      prependPosts(response.data.posts);
      setNewPostsCount(0);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Failed to load new posts");
      console.error(err);
    } finally {
      setIsLoadingNewPosts(false);
    }
  }, [session, isLoadingNewPosts, buildEndpoint, prependPosts, setNewPostsCount, setIsLoadingNewPosts, setError]);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!session) {
      router.push("/discover");
      return;
    }

    if (!loaded) {
      fetchInitialPosts();
    }
  }, [session, sessionLoading, router, loaded, fetchInitialPosts]);

  useEffect(() => {
    if (loaded && posts.length > 0 && scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        setScrollPosition(0);
      }, 100);
    }
  }, [loaded, posts.length, scrollPosition, setScrollPosition]);

  useEffect(() => {
    const saveScroll = () => {
      setScrollPosition(window.scrollY);
    };

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveScroll, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [setScrollPosition]);

  useEffect(() => {
    if (!session || !hasMore || isLoadingMore || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchMorePosts();
        }
      },
      { rootMargin: "400px" }
    );

    const current = loadMoreRef.current;
    observer.observe(current);

    return () => {
      observer.disconnect();
    };
  }, [session, hasMore, isLoadingMore, fetchMorePosts]);

  useEffect(() => {
    if (!session || posts.length === 0) {
      return;
    }
    checkNewPosts();
    newPostsCheckInterval.current = setInterval(checkNewPosts, NEW_POSTS_CHECK_INTERVAL);

    return () => {
      if (newPostsCheckInterval.current) {
        clearInterval(newPostsCheckInterval.current);
      }
    };
  }, [session, posts.length, checkNewPosts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session && posts.length > 0) {
        checkNewPosts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, posts.length, checkNewPosts]);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-[48px] text-[#A0A0A0]">
      <p className="text-[16px]">No posts yet</p>
      <p className="text-[14px] mt-[8px]">Follow users to see their posts here</p>
    </div>
  );

  if (sessionLoading) {
    return (
      <div className="w-full bg-white">
        <div className="w-full mr-auto ml-auto max-w-[630px]">
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white" ref={containerRef}>
      <div className="w-full mr-auto ml-auto max-w-[630px]">
        <NewPostsIndicator count={newPostsCount} onClick={loadNewPosts} />

        <div className="flex flex-col">
          {isInitialLoad && !loaded ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <PostSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          ) : posts.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {isLoadingNewPosts && (
                <>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <PostSkeleton key={`new-skeleton-${i}`} />
                  ))}
                </>
              )}

              {posts.map((post) => (
                <Post
                  key={`${post.id}-${post.isPinned ? "pin" : "post"}-${post.pinnedBy?.id ?? "none"}`}
                  post={post}
                />
              ))}

              <div ref={loadMoreRef} className="h-1" />

              {isLoadingMore && hasMore && (
                <>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <PostSkeleton key={`loading-skeleton-${i}`} />
                  ))}
                </>
              )}

              {error && (
                <ErrorRetry
                  message={error}
                  onRetry={() => {
                    if (error.includes("more")) {
                      fetchMorePosts();
                    } else {
                      fetchInitialPosts();
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
