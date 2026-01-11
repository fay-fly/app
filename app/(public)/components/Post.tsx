import clsx from "clsx";
import Verified from "@/icons/Verified";
import ThreeDots from "@/icons/ThreeDots";
import { PostWithUser } from "@/types/postWithUser";
import { getFormattedDate } from "@/utils/dates";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import UserText from "@/app/(public)/components/UserText";
import CommentButton from "@/app/(public)/discover/components/CommentButton";
import PinButton from "@/app/(public)/discover/components/PinButton";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useState, useRef, memo } from "react";
import FireFilled from "@/icons/FireFilled";
import { hasVerifiedBadge, canDeletePost } from "@/lib/permissions";
import axios from "axios";
import { useRouter } from "next/navigation";
import { handleError } from "@/utils/errors";
import MediaCarousel from "@/components/media/MediaCarousel";
import SafeNextImage from "@/components/SafeNextImage";
import FireOutline from "@/icons/FireOutline";
import Comments from "@/icons/Comments";
import PinOutline from "@/icons/PinOutline";
import Repeat from "@/icons/Repeat";

type PostProps = {
  post: PostWithUser;
  previewMode?: boolean;
};

function Post({ post, previewMode = false }: PostProps) {
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
    if (previewMode) {
      return;
    }
    likeButtonRef.current?.triggerLike();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleSlideChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleDeletePost = async () => {
    if (previewMode || !confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.post("/api/posts/delete", { postId: post.id });
      router.refresh();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="flex flex-col gap-[6px] max-w-[612px] w-full py-[18px]">
      {/* Header - nav profile */}
      <div className="flex items-center gap-[8px] px-[16px]">
        {/* Avatar */}
        <a
          href={`/profile/${post.author.username}`}
          className="h-[32px] w-[32px] relative block shrink-0"
        >
          {post.author.pictureUrl ? (
            <SafeNextImage
              src={post.author.pictureUrl}
              alt="profile image"
              width={32}
              height={32}
              className="rounded-full object-cover w-full h-full border-[1.5px] border-white"
              errorSize="small"
              showErrorText={false}
              sizes="32px"
            />
          ) : (
            <div
              className={clsx(
                "flex h-full w-full items-center justify-center rounded-full border-[1.5px] border-white",
                "bg-[#7c89ff] text-white font-semibold text-[14px]"
              )}
            >
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </a>

        {/* Username and verified badge */}
        <div className="flex-1 flex flex-col gap-[2px] min-w-0">
          <div className="flex items-center h-[22px]">
            <a
              href={`/profile/${post.author.username}`}
              className="font-semibold text-[14px] text-[#343434] tracking-[-0.14px] leading-[22px]"
            >
              {post.author.username}
            </a>
            {hasVerifiedBadge(post.author.role) && (
              <Verified className="w-[16px] h-[16px]" />
            )}
          </div>
          {/* Repost/Pinned indicator */}
          {post.isPinned && post.pinnedBy && (
            <div className="flex items-center gap-[4px]">
              <Repeat className="w-[18px] h-[20px] text-[#a0a0a0]" />
              <a
                href={`/profile/${post.pinnedBy.username}`}
                className="font-semibold text-[14px] text-[#a0a0a0] tracking-[-0.14px] leading-[22px]"
              >
                {post.pinnedBy.username}
              </a>
            </div>
          )}
        </div>

        {/* Menu button */}
        {canDelete && !previewMode && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center justify-center w-[32px] h-[32px] rounded-full cursor-pointer"
            >
              <ThreeDots className="text-[#807d7d]" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-[40px] z-10 w-[200px] rounded-[12px] bg-white shadow-[0px_4px_6px_-1px_rgba(75,75,75,0.1),0px_2px_4px_-2px_rgba(75,75,75,0.12)]">
                <button
                  onClick={handleDeletePost}
                  className="flex items-center gap-[8px] w-full h-[44px] px-[16px] text-left text-[16px] text-[#eb4c4c] hover:bg-gray-50 rounded-[12px] cursor-pointer"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media */}
      {mediaItems.length > 0 && (
        <MediaCarousel
          className="cursor-pointer select-none"
          rounded={false}
          media={mediaItems}
          currentIndex={currentImageIndex}
          onChange={handleSlideChange}
          onDoubleClick={handleImageDoubleClick}
          ariaLabel={`${post.author.username}'s media carousel`}
          showCounter={true}
          showIndicators={false}
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

      {/* Action buttons */}
      {previewMode ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[4px]">
            <div className="flex items-center justify-center gap-[4px] h-[40px] p-[8px] text-[#a0a0a0]">
              <FireOutline />
              <span className="text-[14px] font-medium tracking-[-0.42px]">{post.likesCount}</span>
            </div>
            <div className="flex items-center justify-center gap-[4px] h-[40px] p-[8px] text-[#a0a0a0]">
              <Comments />
              <span className="text-[14px] font-medium tracking-[-0.42px]">{post.commentsCount}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-[4px] h-[40px] p-[8px] text-[#a0a0a0]">
            <PinOutline />
            <span className="text-[14px] font-medium tracking-[-0.42px]">{post.pinsCount}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[4px]">
            <LikeButton
              ref={likeButtonRef}
              postId={post.id}
              likesCount={post.likesCount}
              likedByMe={post.likedByMe}
            />
            <CommentButton commentsCount={post.commentsCount} post={post} />
          </div>
          <PinButton
            postId={post.id}
            pinsCount={post.pinsCount}
            pinnedByMe={post.pinnedByMe}
            disabled={isOwnPost}
          />
        </div>
      )}

      {/* Content - Description and Date */}
      <div className="flex flex-col gap-[6px] px-[16px]">
        {/* Description */}
        <p className="text-[14px] tracking-[-0.14px] text-[#343434] line-clamp-2 leading-[20px]">
          <span className="font-semibold leading-[22px]">{post.author.username} </span>
          <span className="text-[#5b5b5b]">
            <UserText postText={post.text} />
          </span>
        </p>
        {/* Date */}
        <p className="text-[12px] text-[#a0a0a0] tracking-[0.12px] leading-[14px]">
          {getFormattedDate(post.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default memo(Post);
