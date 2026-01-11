"use client";

import type { PostWithUser } from "@/types/postWithUser";
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

    const fetchPosts = async () => {
      try {
        if (activeHashtag) {
          setPosts(undefined);
          const endpoint = `/api/posts/byHashtag?name=${encodeURIComponent(
            activeHashtag
          )}`;
          const response = await axios.get<PostWithUser[]>(endpoint);
          if (cancelled) return;
          if (!cancelled) {
            setPosts(response.data);
          }
          return;
        }

        if (discoverLoaded) {
          setPosts(discoverPosts);
          return;
        }

        setPosts(undefined);
        const response = await axios.get<PostWithUser[]>("/api/posts/all");
        if (cancelled) return;
        if (!cancelled) {
          setPosts(response.data);
          setDiscoverPosts(response.data);
          setDiscoverLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          handleError(error);
          setPosts([]);
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
    discoverPosts,
    setDiscoverPosts,
    setDiscoverLoaded,
  ]);

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
          {!posts ? (
            <div className="grid grid-cols-3 gap-[2px]">
              {[...Array(18)].map((_, index) => (
                <div
                  key={index}
                  className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
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
