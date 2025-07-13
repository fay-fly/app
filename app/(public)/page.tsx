"use client";
import Post from "@/app/(public)/components/Post";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState } from "react";
import axios from "axios";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  const [posts, setPosts] = useState<PostWithUser[]>();

  useEffect(() => {
    axios.get<PostWithUser[]>("/api/posts/all").then((response) => {
      setPosts(response.data);
    });
  }, []);

  return (
    <div className="w-full bg-white pb-[48px] md:pb-0 h-auto min-h-full">
      <div className="w-full mr-auto ml-auto max-w-[630px]">
        <div className="flex flex-col gap-[12px] mb-[12px]">
          {!posts
            ? <PageLoader />
            : posts.map((post) => {
                return <Post post={post} key={post.id} />;
              })}
        </div>
      </div>
    </div>
  );
}
