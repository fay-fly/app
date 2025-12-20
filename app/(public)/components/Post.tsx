import clsx from "clsx";
import Image from "next/image";
import Verified from "@/icons/Verified";
import ThreeDots from "@/icons/ThreeDots";
import { PostWithUser } from "@/types/postWithUser";
import { getFormattedDate } from "@/utils/dates";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import UserText from "@/app/(public)/components/UserText";
import CommentButton from "@/app/(public)/discover/components/CommentButton";
import PinButton from "@/app/(public)/discover/components/PinButton";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useState, useRef } from "react";
import FireFilled from "@/icons/FireFilled";
import PinFilled from "@/icons/PinFilled";
import { hasVerifiedBadge, canDeletePost } from "@/lib/permissions";
import axios from "axios";
import { useRouter } from "next/navigation";
import { handleError } from "@/utils/errors";
import MediaCarousel from "@/components/media/MediaCarousel";

type PostProps = {
  post: PostWithUser;
};

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const { session } = useSafeSession();
  const isOwnPost = session?.user?.id === post.author.id;
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const likeButtonRef = useRef<{ triggerLike: () => void }>(null);
  const mediaItems = post.media ?? [];

  const canDelete = session && canDeletePost(session.user.role, isOwnPost);

  const handleImageDoubleClick = () => {
    likeButtonRef.current?.triggerLike();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleSlideChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.post("/api/posts/delete", { postId: post.id });
      router.refresh();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="mb-[12px] flex flex-col">
      {post.isPinned && post.pinnedBy && (
        <div className="flex items-center gap-[8px] px-[16px] pt-[8px] text-[12px] text-[#A0A0A0]">
          <PinFilled className="h-[14px] w-[14px]" />
          <span>
            Pinned by{" "}
            <a
              href={`/profile/${post.pinnedBy.username}`}
              className="font-semibold hover:underline"
            >
              {post.pinnedBy.username}
            </a>
          </span>
        </div>
      )}
      <div className="mb-[8px] flex justify-between px-[16px] py-[8px]">
        <div className="flex items-center gap-[8px]">
          <a
            href={`/profile/${post.author.username}`}
            className="h-[32px] w-[32px] relative"
          >
            {post.author.pictureUrl ? (
              <Image
                src={post.author.pictureUrl}
                alt="profile image"
                width={32}
                height={32}
                className="rounded-full object-cover"
                quality={85}
              />
            ) : (
              <div
                className={clsx(
                  "flex h-full w-full items-center justify-center rounded-full",
                  "bg-(--fly-primary) text-(--fly-white)"
                )}
              >
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </a>
          <a
            href={`/profile/${post.author.username}`}
            className="font-semibold text-(--fly-text-primary)"
          >
            {post.author.username}
          </a>
          {hasVerifiedBadge(post.author.role) && <Verified />}
        </div>
        <div className="flex items-center gap-[16px]">
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="cursor-pointer"
              >
                <ThreeDots />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 z-10 min-w-[120px] rounded-lg border bg-white shadow-lg">
                  <button
                    onClick={handleDeletePost}
                    className="block w-full rounded-lg px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mediaItems.length > 0 && (
        <MediaCarousel
          className="cursor-pointer select-none"
          rounded={false}
          media={mediaItems}
          currentIndex={currentImageIndex}
          onChange={handleSlideChange}
          onDoubleClick={handleImageDoubleClick}
          ariaLabel={`${post.author.username}'s media carousel`}
        >
          {showLikeAnimation && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="animate-like-burst">
                <FireFilled className="h-[100px] w-[100px] text-[#FF6B6B] drop-shadow-[0_0_20px_rgba(255,107,107,0.8)]" />
              </div>
            </div>
          )}
        </MediaCarousel>
      )}

      <div className="mt-[8px] flex justify-between text-[#A0A0A0]">
        <div className="flex">
          <LikeButton
            ref={likeButtonRef}
            postId={post.id}
            likesCount={post.likesCount}
            likedByMe={post.likedByMe}
          />
          <CommentButton commentsCount={post.commentsCount} post={post} />
        </div>
        <div className="m-[8px] flex items-center gap-[4px]">
          <PinButton
            postId={post.id}
            pinsCount={post.pinsCount}
            pinnedByMe={post.pinnedByMe}
            disabled={isOwnPost}
          />
        </div>
      </div>
      <p className="mt-[8px] px-[16px] text-[#5B5B5B] whitespace-pre-wrap">
        <span className="font-semibold">{post.author.username}</span>{" "}
        <UserText postText={post.text} />
      </p>
      <div className="px-[16px] text-[#A0A0A0]">
        {getFormattedDate(post.createdAt)}
      </div>
    </div>
  );
}
