import clsx from "clsx";
import type { PostWithUser } from "@/app/types/postWithUser";
import PostPreview from "@/app/(public)/components/Post";
import { useEffect, useRef, useState } from "react";
import useScreenWidth from "@/app/hooks/useScreenWidth";

type PostPreviewProps = {
  className?: string;
  posts: PostWithUser[];
};

export default function PostsPreview({ posts, className }: PostPreviewProps) {
  const width = useScreenWidth();
  const isMobile = width !== null && width < 768;
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [postIdToPreview, setPostIdToPreview] = useState<number>();
  const [previewMode, setPreviewMode] = useState("imagesList");

  const onPreviewOpen = (id: number) => {
    setPostIdToPreview(id);
    if (isMobile) {
      setPreviewMode("feed");
    } else {
      alert("Preview");
    }
  };

  useEffect(() => {
    if (!postIdToPreview) {
      return;
    }

    if (isMobile) {
      if (
        previewMode === "feed" &&
        postIdToPreview &&
        postRefs.current[postIdToPreview]
      ) {
        const element = postRefs.current[postIdToPreview];
        const yOffset = -56;
        const y = element!.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, })
      }
    }
  }, [postIdToPreview]);

  return (
    <>
      {previewMode === "imagesList" ? (
        <div className={clsx("grid grid-cols-3 gap-[2px]", className)}>
          {posts.map((post) => {
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
                <div
                  className={clsx(
                    "absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 opacity-0",
                    "hover:opacity-70 transition-opacity duration-100 cursor-pointer"
                  )}
                  onClick={() => onPreviewOpen(post.id)}
                ></div>
              </div>
            );
          })}
        </div>
      ) : previewMode === "feed" ? (
        posts.map((post) => {
          return (
            <div
              key={post.id}
              ref={(el) => {
                postRefs.current[post.id] = el;
              }}
            >
              <PostPreview post={post} />
            </div>
          );
        })
      ) : null}
    </>
  );
}
