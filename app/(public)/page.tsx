"use client";
import Post from "@/app/(public)/components/Post";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState } from "react";
import axios from "axios";
import PageLoader from "@/components/PageLoader";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useRouter } from "next/navigation";

export default function Home() {
  const { session, status } = useSafeSession();
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithUser[]>();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/discover");
      return;
    }

    axios.get<PostWithUser[]>("/api/posts/feed").then((response) => {
      setPosts(response.data);
    });
  }, [session, status, router]);

  const onSubscribe = (authorId: number) => {
    setPosts((prev) =>
      prev?.map((p) => {
        if (p.author.id == authorId) {
          console.log(authorId);
          return { ...p, isFollowed: !p.isFollowed };
        } else {
          return p;
        }
      })
    );
  };

  return (
    <div className="w-full bg-white h-auto min-h-full">
      <div className="w-full mr-auto ml-auto max-w-[630px] h-full">
        <div className="flex flex-col">
          {!posts ? (
            <PageLoader />
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[48px] text-[#A0A0A0]">
              <p className="text-[16px]">No posts yet</p>
              <p className="text-[14px] mt-[8px]">
                Follow users to see their posts here
              </p>
            </div>
          ) : (
            posts.map((post) => {
              return (
                <Post
                  key={`${post.isFollowed}-${post.id}`}
                  post={post}
                  onSubscribe={() => onSubscribe(post.author.id)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
