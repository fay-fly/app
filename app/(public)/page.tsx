"use client";
import Post from "@/app/(public)/components/Post";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import PageLoader from "@/components/PageLoader";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useRouter } from "next/navigation";

const PAGE_LIMIT = 5;

type FeedResponse = {
  posts: PostWithUser[];
  nextCursor: number | null;
  hasMore: boolean;
};

export default function Home() {
  const { session, isLoading: sessionLoading } = useSafeSession();
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
        setPosts((prev) =>
          reset ? response.data.posts : [...prev, ...response.data.posts]
        );
        setNextCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
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
    [buildEndpoint, session]
  );

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (!session) {
      router.push("/discover");
      return;
    }

    let isMounted = true;
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPosts({ reset: true, cursor: null }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [session, sessionLoading, router, fetchPosts]);

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
    setPosts((prev) =>
      prev.map((p) =>
        p.author.id === authorId ? { ...p, isFollowed: !p.isFollowed } : p
      )
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-[48px] text-[#A0A0A0]">
      <p className="text-[16px]">No posts yet</p>
      <p className="text-[14px] mt-[8px]">Follow users to see their posts here</p>
    </div>
  );

  if (sessionLoading) {
    return (
      <div className="w-full bg-white h-auto min-h-full">
        <div className="w-full mr-auto ml-auto max-w-[630px] h-full">
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white h-auto min-h-full">
      <div className="w-full mr-auto ml-auto max-w-[630px] h-full">
        <div className="flex flex-col">
          {isLoading ? (
            <PageLoader />
          ) : posts.length === 0 ? (
            renderEmptyState()
          ) : (
            posts.map((post) => (
              <Post
                key={`${post.isFollowed}-${post.id}`}
                post={post}
                onSubscribe={() => onSubscribe(post.author.id)}
              />
            ))
          )}
          <div ref={loadMoreRef} className="h-10" />
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
