"use client";
import Post from "@/app/(public)/components/Post";
import type { PostWithUser } from "@/types/postWithUser";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import PageLoader from "@/components/PageLoader";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useRouter } from "next/navigation";
import { useHomePostsStore } from "@/store/homePostsStore";
import { hydratePostsMedia } from "@/utils/mediaDimensions";

const PAGE_LIMIT = 5;

type FeedResponse = {
  posts: PostWithUser[];
  nextCursor: number | null;
  hasMore: boolean;
};

export default function Home() {
  const { session, isLoading: sessionLoading } = useSafeSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    posts,
    nextCursor,
    hasMore,
    loaded,
    setPosts,
    appendPosts,
    setNextCursor,
    setHasMore,
    setLoaded,
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

  const fetchPosts = useCallback(
    async ({ cursor, reset }: { cursor?: number | null; reset?: boolean } = {}) => {
      if (!session) {
        return;
      }

      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const endpoint = buildEndpoint(cursor ?? null);
        const response = await axios.get<FeedResponse>(endpoint);

        const hydratedPosts = await hydratePostsMedia(response.data.posts);

        if (reset) {
          setPosts(hydratedPosts);
        } else {
          appendPosts(hydratedPosts);
        }

        setNextCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
        setLoaded(true);
      } catch (error) {
        console.error(error);
      } finally {
        if (reset) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [buildEndpoint, session, setPosts, appendPosts, setNextCursor, setHasMore, setLoaded]
  );

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!session) {
      router.push("/discover");
      return;
    }

    // Only fetch if not already loaded
    if (!loaded) {
      let isMounted = true;
      fetchPosts({ reset: true, cursor: null }).catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [session, sessionLoading, router, fetchPosts, loaded]);

  useEffect(() => {
    if (
      !session ||
      sessionLoading ||
      !hasMore ||
      isLoading ||
      isLoadingMore ||
      !loadMoreRef.current
    ) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        fetchPosts({ cursor: nextCursor ?? null });
      }
    });

    const current = loadMoreRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      observer.disconnect();
    };
  }, [fetchPosts, hasMore, isLoading, isLoadingMore, nextCursor, session, sessionLoading]);

  const onSubscribe = (authorId: number) => {
    posts.forEach((post) => {
      if (post.author.id === authorId) {
        updatePost(post.id, { isFollowed: !post.isFollowed });
      }
    });
  };

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
    <div className="w-full bg-white">
      <div className="w-full mr-auto ml-auto max-w-[630px]">
        <div className="flex flex-col">
          {isLoading ? (
            <PageLoader />
          ) : posts.length === 0 ? (
            renderEmptyState()
          ) : (
            posts.map((post, index) => (
              <Post
                key={`${post.id}-${post.isPinned ? "pin" : "post"}-${post.pinnedBy?.id ?? "none"}-${index}`}
                post={post}
                onSubscribe={() => onSubscribe(post.author.id)}
              />
            ))
          )}
          <div ref={loadMoreRef} className="h-1" />
          {isLoadingMore && (
            <div className="py-4 text-center text-sm text-[#909090]">
              Loading more…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
