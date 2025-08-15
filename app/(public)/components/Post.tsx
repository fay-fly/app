import clsx from "clsx";
import Verified from "@/icons/Verified";
import Button from "@/components/Button";
import ThreeDots from "@/icons/ThreeDots";
import Comments from "@/icons/Comments";
import Pin from "@/icons/Pin";
import { PostWithUser } from "@/app/types/postWithUser";
import { getFormattedDate } from "@/utils/dates";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import Image from "next/image";
import PostText from "@/app/(public)/components/PostText";
import CommentButton from "@/app/(public)/discover/components/CommentButton";

type PostProps = {
  post: PostWithUser;
};

export default function Post({ post }: PostProps) {
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
      <Image src={post.imageUrl} alt="foto" className="w-full" width={1} height={1} unoptimized />
      <div className="flex justify-between text-[#A0A0A0]">
        <div className="flex">
          <LikeButton postId={post.id} likesCount={post.likesCount} likedByMe={post.likedByMe} />
          <CommentButton commentsCount={post.commentsCount} />
        </div>
        <div>
          <div className="flex gap-[4px] m-[8px] items-center">
            <Pin />
            {post.pinsCount}
          </div>
        </div>
      </div>
      <PostText postText={post.text} username={post.author.username} />
      <div className="px-[16px] text-[#A0A0A0]">
        {getFormattedDate(post.createdAt)}
      </div>
    </div>
  );
}
