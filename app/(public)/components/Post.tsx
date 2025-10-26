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
import { useState, useRef } from "react";
import FireFilled from "@/icons/FireFilled";

type PostProps = {
  post: PostWithUser;
  onSubscribe?: () => void;
};

export default function Post({ post, onSubscribe }: PostProps) {
  const { session } = useSafeSession();
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const likeButtonRef = useRef<{ triggerLike: () => void }>(null);

  const handleImageDoubleClick = () => {
    likeButtonRef.current?.triggerLike();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  return (
    <div className="flex flex-col mb-[12px]">
      <div className="py-[8px] flex justify-between px-[16px] mb-[8px]">
        <div className="flex gap-[8px] items-center">
          <div className="w-[32px] h-[32px]">
            {post.author.pictureUrl ? (
              <img
                src={post.author.pictureUrl}
                alt="profile image"
                className="rounded-full w-[32px] h-[32px]"
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
      <div
        className="relative cursor-pointer select-none overflow-hidden"
        onDoubleClick={handleImageDoubleClick}
      >
        <Image
          src={post.imageUrl}
          alt="foto"
          className="w-full block leading-none"
          width={1}
          height={1}
          unoptimized
        />
        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-like-burst">
              <FireFilled className="w-[100px] h-[100px] text-[#FF6B6B] drop-shadow-[0_0_20px_rgba(255,107,107,0.8)]" />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[#A0A0A0] mt-[8px]">
        <div className="flex">
          <LikeButton
            ref={likeButtonRef}
            postId={post.id}
            likesCount={post.likesCount}
            likedByMe={post.likedByMe}
          />
          <CommentButton commentsCount={post.commentsCount} post={post} />
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
      <p className="px-[16px] text-[#5B5B5B] whitespace-pre-wrap mt-[8px]">
        <span className="font-semibold">{post.author.username}</span>{" "}
        <UserText postText={post.text} />
      </p>
      <div className="px-[16px] text-[#A0A0A0] mt-[8px]">
        {getFormattedDate(post.createdAt)}
      </div>
    </div>
  );
}
