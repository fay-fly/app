"use client";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState } from "react";
import axios from "axios";
import PostsPreview from "@/app/(public)/discover/components/PostsPreview";
import { handleError } from "@/utils/errors";
import { useSearchParams, useRouter } from "next/navigation";

export default function Discover() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeHashtag = searchParams.get("hashtag");

  const [posts, setPosts] = useState<PostWithUser[]>();

  const clearHashtagFilter = () => {
    router.push("/discover");
  };

  useEffect(() => {
    let cancelled = false;
    setPosts(undefined);

    const endpoint = activeHashtag
      ? `/api/posts/byHashtag?name=${encodeURIComponent(activeHashtag)}`
      : "/api/posts/all";

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

    return () => {
      cancelled = true;
    };
  }, [activeHashtag]);

  return (
    <div className="w-full bg-white h-auto min-h-full pb-[48px] md:pb-0 ">
      <div className="w-full h-full mr-auto ml-auto max-w-[1000px]">
        <div className="px-4 md:px-0 py-3 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-(--fly-text-primary)">
            Discover
          </h1>
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

        <div className="px-0 py-6">
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
