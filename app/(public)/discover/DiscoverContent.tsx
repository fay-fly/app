"use client";

import type { PostWithUser } from "@/types/postWithUser";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import PostsPreview from "@/app/(public)/discover/components/PostsPreview";
import { handleError } from "@/utils/errors";
import { useSearchParams, useRouter } from "next/navigation";
import { useDiscoverPostsStore } from "@/store/discoverPostsStore";

type PaginatedResponse = {
  posts: PostWithUser[];
  nextCursor: number | null;
  hasMore: boolean;
};

export default function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeHashtag = searchParams.get("hashtag");

  const {
    posts: discoverPosts,
    nextCursor: discoverCursor,
    hasMore: discoverHasMore,
    loaded: discoverLoaded,
    isLoadingMore: discoverLoadingMore,
    setPosts: setDiscoverPosts,
    appendPosts: appendDiscoverPosts,
    setNextCursor: setDiscoverCursor,
    setHasMore: setDiscoverHasMore,
    setLoaded: setDiscoverLoaded,
    setIsLoadingMore: setDiscoverLoadingMore,
    reset: resetDiscover,
  } = useDiscoverPostsStore();

  // Local state for hashtag-filtered posts (separate pagination)
  const [hashtagPosts, setHashtagPosts] = useState<PostWithUser[]>([]);
  const [hashtagCursor, setHashtagCursor] = useState<number | null>(null);
  const [hashtagHasMore, setHashtagHasMore] = useState(true);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Determine which state to use based on activeHashtag
  const posts = activeHashtag ? hashtagPosts : discoverPosts;
  const hasMore = activeHashtag ? hashtagHasMore : discoverHasMore;
  const isLoadingMore = activeHashtag ? hashtagLoading : discoverLoadingMore;
  const nextCursor = activeHashtag ? hashtagCursor : discoverCursor;

  const clearHashtagFilter = () => {
    router.push("/discover");
  };

  // Fetch more posts
  const fetchMorePosts = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    if (activeHashtag) {
      setHashtagLoading(true);
    } else {
      setDiscoverLoadingMore(true);
    }

    try {
      const endpoint = activeHashtag
        ? `/api/posts/byHashtag?name=${encodeURIComponent(activeHashtag)}&cursor=${nextCursor}`
        : `/api/posts/all?cursor=${nextCursor}`;

      const response = await axios.get<PaginatedResponse>(endpoint);
      const { posts: newPosts, nextCursor: newCursor, hasMore: newHasMore } = response.data;

      if (activeHashtag) {
        setHashtagPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
        setHashtagCursor(newCursor);
        setHashtagHasMore(newHasMore);
      } else {
        appendDiscoverPosts(newPosts);
        setDiscoverCursor(newCursor);
        setDiscoverHasMore(newHasMore);
      }
    } catch (error) {
      handleError(error);
    } finally {
      if (activeHashtag) {
        setHashtagLoading(false);
      } else {
        setDiscoverLoadingMore(false);
      }
    }
  }, [
    activeHashtag,
    hasMore,
    isLoadingMore,
    nextCursor,
    appendDiscoverPosts,
    setDiscoverCursor,
    setDiscoverHasMore,
    setDiscoverLoadingMore,
  ]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchMorePosts();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [fetchMorePosts]);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      try {
        if (activeHashtag) {
          // Reset hashtag state when hashtag changes
          setHashtagPosts([]);
          setHashtagCursor(null);
          setHashtagHasMore(true);
          setIsInitialLoad(true);

          const endpoint = `/api/posts/byHashtag?name=${encodeURIComponent(activeHashtag)}`;
          const response = await axios.get<PaginatedResponse>(endpoint);
          if (cancelled) return;

          const { posts: newPosts, nextCursor: newCursor, hasMore: newHasMore } = response.data;
          setHashtagPosts(newPosts);
          setHashtagCursor(newCursor);
          setHashtagHasMore(newHasMore);
          setIsInitialLoad(false);
          return;
        }

        // No hashtag - use discover store
        if (discoverLoaded && discoverPosts.length > 0) {
          setIsInitialLoad(false);
          return;
        }

        setIsInitialLoad(true);
        const response = await axios.get<PaginatedResponse>("/api/posts/all");
        if (cancelled) return;

        const { posts: newPosts, nextCursor: newCursor, hasMore: newHasMore } = response.data;
        setDiscoverPosts(newPosts);
        setDiscoverCursor(newCursor);
        setDiscoverHasMore(newHasMore);
        setDiscoverLoaded(true);
        setIsInitialLoad(false);
      } catch (error) {
        if (!cancelled) {
          handleError(error);
          if (activeHashtag) {
            setHashtagPosts([]);
          } else {
            setDiscoverPosts([]);
          }
          setIsInitialLoad(false);
        }
      }
    };

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [
    activeHashtag,
    discoverLoaded,
    discoverPosts.length,
    setDiscoverPosts,
    setDiscoverCursor,
    setDiscoverHasMore,
    setDiscoverLoaded,
  ]);

  const showInitialLoading = isInitialLoad && posts.length === 0;

  return (
    <div className="w-full bg-white">
      <div className="w-full mr-auto ml-auto max-w-[1000px]">
        {activeHashtag && (
          <div className="flex flex-col gap-[24px] items-center pt-[24px] mb-[24px]">
            <h1 className="font-semibold text-[20px] text-[#343434] tracking-[-0.2px] leading-[24px]">
              {activeHashtag}
            </h1>
          </div>
        )}

        <div>
          {showInitialLoading ? (
            <div className="grid grid-cols-3 gap-[2px]">
              {[...Array(18)].map((_, index) => (
                <div
                  key={index}
                  className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <PostsPreview posts={posts} />
              {/* Load more trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="w-full">
                  {isLoadingMore && (
                    <div className="grid grid-cols-3 gap-[2px]">
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={`loading-${index}`}
                          className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
