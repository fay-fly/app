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
