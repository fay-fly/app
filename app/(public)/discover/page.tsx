"use client";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Discover() {
  const [posts, setPosts] = useState<PostWithUser[]>();

  useEffect(() => {
    axios.get<PostWithUser[]>("/api/posts/all").then((response) => {
      setPosts(response.data);
    });
  }, []);

  return (
    <div className="w-full bg-white mb-[48px] h-auto min-h-full">
      <div className="w-full mr-auto ml-auto max-w-[1000px]">
        <h1 className="text-[#343434] text-[20px] font-semibold py-[16px]">
          Discover
        </h1>
        <div className="grid grid-cols-3 gap-[2px]">
          {!posts
            ? "Loading..."
            : posts.map((post) => {
                return (
                  <div
                    key={post.id}
                    className="w-full aspect-square overflow-hidden rounded bg-gray-100"
                  >
                    <img
                      src={post.imageUrl}
                      alt="publication"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
