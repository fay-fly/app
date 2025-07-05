"use client";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState } from "react";
import axios from "axios";
import clsx from "clsx";

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
        <h1 className="text-[#343434] text-[20px] font-semibold py-[16px] mx-[20px]">
          Discover
        </h1>
        <div className="grid grid-cols-3 gap-[2px]">
          {!posts
            ? "Loading..."
            : posts.map((post) => {
                return (
                  <div
                    key={post.id}
                    className="w-full aspect-square overflow-hidden bg-gray-100 relative w-full h-full"
                  >
                    <img
                      src={post.imageUrl}
                      alt="publication"
                      className="w-full h-full object-cover"
                    />
                    <div className={clsx(
                      "absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 opacity-0",
                      "hover:opacity-70 transition-opacity duration-100 cursor-pointer",
                    )}></div>
                  </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
