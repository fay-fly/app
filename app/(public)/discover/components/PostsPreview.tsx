import clsx from "clsx";
import {PostWithUser, Post} from "@/app/types/postWithUser";

type PostPreviewProps = {
  className?: string;
  posts: Post[] | PostWithUser[]
}

export default function PostsPreview({ posts, className }: PostPreviewProps) {


  return (
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
            ></div>
          </div>
        );
      })}
    </div>
  );
}
