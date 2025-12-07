"use client";

import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState } from "react";
import axios from "axios";
import PostsPreview from "@/app/(public)/discover/components/PostsPreview";
import { handleError } from "@/utils/errors";
import { useSearchParams, useRouter } from "next/navigation";
import { useDiscoverPostsStore } from "@/store/discoverPostsStore";

export default function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeHashtag = searchParams.get("hashtag");

  const {
    posts: discoverPosts,
    loaded: discoverLoaded,
    setPosts: setDiscoverPosts,
    setLoaded: setDiscoverLoaded,
  } = useDiscoverPostsStore();

  const [posts, setPosts] = useState<PostWithUser[] | undefined>(
    discoverLoaded && !activeHashtag ? discoverPosts : undefined
  );

  const clearHashtagFilter = () => {
    router.push("/discover");
  };

  useEffect(() => {
    let cancelled = false;

    // If filtering by hashtag, always fetch fresh data
    if (activeHashtag) {
      setPosts(undefined);
      const endpoint = `/api/posts/byHashtag?name=${encodeURIComponent(activeHashtag)}`;

      axios
        .get<PostWithUser[]>(endpoint)
        .then((response) => {
          if (!cancelled) {
            setPosts(response.data);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            handleError(error);
            setPosts([]);
          }
        });
    } else {
      // For all posts, use cached data if available
      if (discoverLoaded) {
        setPosts(discoverPosts);
      } else {
        setPosts(undefined);
        const endpoint = "/api/posts/all";

        axios
          .get<PostWithUser[]>(endpoint)
          .then((response) => {
            if (!cancelled) {
              setPosts(response.data);
              setDiscoverPosts(response.data);
              setDiscoverLoaded(true);
            }
          })
          .catch((error) => {
            if (!cancelled) {
              handleError(error);
              setPosts([]);
            }
          });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [activeHashtag, discoverLoaded, discoverPosts, setDiscoverPosts, setDiscoverLoaded]);

  return (
    <div className="w-full bg-white">
      <div className="w-full mr-auto ml-auto max-w-[1000px]">
        <div className="px-4 md:px-0 py-3">
          {activeHashtag && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-(--fly-primary)/30 bg-(--fly-primary)/5 px-4 py-3 text-sm text-(--fly-text-primary)">
              <div className="flex flex-col">
                <span>
                  Showing posts for{" "}
                  <span className="font-semibold">#{activeHashtag}</span>
                </span>
                {typeof posts !== "undefined" && (
                  <span className="text-xs text-[#909090]">
                    {posts.length} {posts.length === 1 ? "post" : "posts"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={clearHashtagFilter}
                className="rounded-full border border-(--fly-primary) px-3 py-1 text-(--fly-primary) transition hover:bg-(--fly-primary)/10"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        <div>
          {!posts ? (
            <div className="grid grid-cols-3 gap-[2px]">
              {[...Array(18)].map((_, index) => (
                <div
                  key={index}
                  className="w-full aspect-square bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <PostsPreview posts={posts} />
          )}
        </div>
      </div>
    </div>
  );
}
