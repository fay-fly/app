import clsx from "clsx";
import Verified from "@/icons/Verified";
import Button from "@/components/Button";
import ThreeDots from "@/icons/ThreeDots";
import Comments from "@/icons/Comments";
import Fire from "@/icons/Fire";
import Pin from "@/icons/Pin";
import { PostWithUser } from "@/app/types/postWithUser";
import { getFormattedDate } from "@/utils/dates";
import { useState } from "react";
import LikeButton from "@/app/(public)/discover/components/LikeButton";

type PostProps = {
  post: PostWithUser;
};

const highlightHashtags = (text: string) => {
  const hashtagRegex = /(#\w+)/g;
  const parts = text.split(hashtagRegex);

  return parts.map((part, index) =>
    hashtagRegex.test(part) ? (
      <span key={index} className="text-[#19B4F6]">
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default function Post({ post }: PostProps) {
  const [showFullText, setShowFullText] = useState(false);

  const isLongText = post.text.length > 100;
  const displayedText = showFullText
    ? post.text
    : post.text.slice(0, 100).trim();

  return (
    <div className="flex flex-col gap-[8px] mb-[12px]">
      <div className="py-[8px] flex justify-between px-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="w-[32px] h-[32px] relative">
            <div
              className={clsx(
                "w-full h-full bg-(--fly-primary) flex",
                "justify-center items-center text-(--fly-white) rounded-full"
              )}
            >
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <a
            href={`/profile/${post.author.id}`}
            className="text-(--fly-text-primary) font-semibold"
          >
            {post.author.username}
          </a>
          <Verified />
        </div>
        <div className="flex gap-[16px] items-center">
          <Button
            type="button"
            className="bg-(--fly-primary) text-(--fly-white) px-[16px] py-[5px] h-[32px]"
          >
            Subscribe
          </Button>
          <ThreeDots />
        </div>
      </div>
      <img src={post.imageUrl} alt="foto" className="w-full" />
      <div className="flex justify-between text-[#A0A0A0]">
        <div className="flex">
          <LikeButton postId={post.id} likesCount={post.likesCount} likedByMe={post.likedByMe} />
          <div className="flex gap-[4px] m-[8px] items-center">
            <Comments />
            {post.commentsCount}
          </div>
        </div>
        <div>
          <div className="flex gap-[4px] m-[8px] items-center">
            <Pin />
            {post.pinsCount}
          </div>
        </div>
      </div>
      <p className="px-[16px] text-[#5B5B5B] whitespace-pre-wrap">
        <span className="font-semibold">{post.author.username}</span>{" "}
        {highlightHashtags(displayedText)}
        {isLongText && !showFullText && "..."}{" "}
        {isLongText && (
          <span
            onClick={() => setShowFullText(!showFullText)}
            className="text-blue-500 hover:underline mt-2 cursor-pointer"
          >
            {!showFullText && "Show more"}
          </span>
        )}
      </p>
      <div className="px-[16px] text-[#A0A0A0]">
        {getFormattedDate(post.createdAt)}
      </div>
    </div>
  );
}
