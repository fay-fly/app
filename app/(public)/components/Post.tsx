import clsx from "clsx";
import Verified from "@/icons/Verified";
import ThreeDots from "@/icons/ThreeDots";
import { PostWithUser } from "@/app/types/postWithUser";
import { getFormattedDate } from "@/utils/dates";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import Image from "next/image";
import UserText from "@/app/(public)/components/UserText";
import CommentButton from "@/app/(public)/discover/components/CommentButton";
import PinButton from "@/app/(public)/discover/components/PinButton";
import SubscribeButton from "@/app/(public)/discover/components/SubscribeButton";
import { useSafeSession } from "@/hooks/useSafeSession";

type PostProps = {
  post: PostWithUser;
  onSubscribe?: () => void;
};

export default function Post({ post, onSubscribe }: PostProps) {
  const { session } = useSafeSession();

  return (
    <div className="flex flex-col gap-[8px] mb-[12px]">
      <div className="py-[8px] flex justify-between px-[16px]">
        <div className="flex gap-[8px] items-center">
          <div className="w-[32px] h-[32px]">
            {post.author.pictureUrl ? (
              <img
                src={post.author.pictureUrl}
                alt="profile image"
                className="rounded-full"
              />
            ) : (
              <div
                className={clsx(
                  "w-full h-full bg-(--fly-primary) flex",
                  "justify-center items-center text-(--fly-white) rounded-full"
                )}
              >
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <a
            href={`/profile/${post.author.username}`}
            className="text-(--fly-text-primary) font-semibold"
          >
            {post.author.username}
          </a>
          <Verified />
        </div>
        <div className="flex gap-[16px] items-center">
          {session && post.author.id !== session.user.id && (
            <SubscribeButton
              subscribingId={post.author.id}
              isSubscribed={post.isFollowed}
              onSuccess={() => onSubscribe && onSubscribe()}
            />
          )}
          <ThreeDots />
        </div>
      </div>
      <Image
        src={post.imageUrl}
        alt="foto"
        className="w-full"
        width={1}
        height={1}
        unoptimized
      />
      <div className="flex justify-between text-[#A0A0A0]">
        <div className="flex">
          <LikeButton
            postId={post.id}
            likesCount={post.likesCount}
            likedByMe={post.likedByMe}
          />
          <CommentButton commentsCount={post.commentsCount} postId={post.id} />
        </div>
        <div>
          <div className="flex gap-[4px] m-[8px] items-center">
            <PinButton
              postId={post.id}
              pinsCount={post.pinsCount}
              pinnedByMe={post.pinnedByMe}
            />
          </div>
        </div>
      </div>
      <p className="px-[16px] text-[#5B5B5B] whitespace-pre-wrap">
        <span className="font-semibold">{post.author.username}</span>{" "}
        <UserText postText={post.text} />
      </p>
      <div className="px-[16px] text-[#A0A0A0]">
        {getFormattedDate(post.createdAt)}
      </div>
    </div>
  );
}
