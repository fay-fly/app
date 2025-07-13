"use client";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState } from "react";
import axios from "axios";
import PostsPreview from "@/app/(public)/discover/components/PostsPreview";

export default function Discover() {
  const [posts, setPosts] = useState<PostWithUser[]>();

  useEffect(() => {
    axios.get<PostWithUser[]>("/api/posts/all").then((response) => {
      setPosts(response.data);
    });
  }, []);

  return (
    <div className="w-full bg-white h-auto min-h-full pb-[48px] md:pb-0 ">
      <div className="w-full h-full mr-auto ml-auto max-w-[1000px]">
        {!posts ? "Loading..." : <PostsPreview posts={posts} />}
      </div>
    </div>
  );
}
