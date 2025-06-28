"use client";
import Post from "@/app/(public)/components/Post";
import type { UserPost } from "@/app/types/userPost";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [posts, setPosts] = useState<UserPost[]>();

  useEffect(() => {
    axios.get<UserPost[]>("/api/posts/all").then((response) => {
      setPosts(response.data);
    });
  }, []);

  return (
    <div className="w-full bg-white mb-[48px]">
      <div className="w-full mr-auto ml-auto max-w-[630px]">
        <div className="flex flex-col gap-[12px] mb-[12px]">
          {!posts
            ? "Loading..."
            : posts.map((post) => {
                return <Post post={post} key={post.id} />;
              })}
        </div>
      </div>
    </div>
  );
}
