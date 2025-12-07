import clsx from "clsx";
import Verified from "@/icons/Verified";
import ThreeDots from "@/icons/ThreeDots";
import { PostWithUser } from "@/app/types/postWithUser";
import { getFormattedDate } from "@/utils/dates";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import UserText from "@/app/(public)/components/UserText";
import CommentButton from "@/app/(public)/discover/components/CommentButton";
import PinButton from "@/app/(public)/discover/components/PinButton";
import SubscribeButton from "@/app/(public)/discover/components/SubscribeButton";
import { useSafeSession } from "@/hooks/useSafeSession";
import { useState, useRef } from "react";
import FireFilled from "@/icons/FireFilled";
import PinFilled from "@/icons/PinFilled";
import SafeImage from "@/components/SafeImage";

type PostProps = {
  post: PostWithUser;
  onSubscribe?: () => void;
};

export default function Post({ post, onSubscribe }: PostProps) {
  const { session } = useSafeSession();
  const isOwnPost = session?.user?.id === post.author.id;
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const likeButtonRef = useRef<{ triggerLike: () => void }>(null);
  const [landscapeMap, setLandscapeMap] = useState<Record<number, boolean>>({});
  const [hasPortraitImage, setHasPortraitImage] = useState(true);
  const portraitFoundRef = useRef(false);
  const imagesLoadedRef = useRef(0);

  const handleImageDoubleClick = () => {
    likeButtonRef.current?.triggerLike();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < post.imageUrls.length - 1 ? prev + 1 : prev
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : prev
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const minSwipeDistance = 50;
    const distance = touchStart - touchEnd;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      nextImage();
    } else {
      previousImage();
    }
  };

  return (
    <div className="flex flex-col mb-[12px]">
      {post.isPinned && post.pinnedBy && (
        <div className="flex items-center gap-[8px] px-[16px] pt-[8px] text-[#A0A0A0] text-[12px]">
          <PinFilled className="w-[14px] h-[14px]" />
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
      <div className="py-[8px] flex justify-between px-[16px] mb-[8px]">
        <div className="flex gap-[8px] items-center">
          <a href={`/profile/${post.author.username}`} className="w-[32px] h-[32px]">
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
          </a>
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
        className={clsx(
          "relative cursor-pointer select-none overflow-hidden group",
          hasPortraitImage && "bg-[--fly-bg-primary]"
        )}
        style={hasPortraitImage ? { aspectRatio: "4 / 5" } : undefined}
        onDoubleClick={handleImageDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={clsx(
            "flex transition-transform duration-300 ease-out",
            hasPortraitImage && "h-full"
          )}
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {post.imageUrls && post.imageUrls.map((url, index) => (
            <div
              key={index}
              className={clsx(
                "min-w-full flex justify-center",
                hasPortraitImage ? "h-full items-center bg-[--fly-bg-primary]" : "items-start"
              )}
            >
              <SafeImage
                src={url}
                alt={`foto ${index + 1}`}
                className={clsx(
                  hasPortraitImage
                    ? landscapeMap[index]
                      ? "max-h-full max-w-full object-contain"
                      : "h-full w-full object-cover"
                    : "w-full h-auto object-contain"
                )}
                onLoad={(event) => {
                  const target = event.currentTarget;
                  const isLandscape = target.naturalWidth >= target.naturalHeight;
                  const isPortrait = target.naturalHeight > target.naturalWidth;

                  if (isPortrait) {
                    portraitFoundRef.current = true;
                    if (!hasPortraitImage) {
                      setHasPortraitImage(true);
                    }
                  }

                  setLandscapeMap((prev) => {
                    if (prev[index] === isLandscape) {
                      return prev;
                    }
                    return { ...prev, [index]: isLandscape };
                  });

                  imagesLoadedRef.current += 1;
                  if (
                    imagesLoadedRef.current === (post.imageUrls?.length ?? 0) &&
                    !portraitFoundRef.current
                  ) {
                    setHasPortraitImage(false);
                  }
                }}
                loading={index === 0 ? "eager" : "lazy"}
                errorSize="medium"
              />
            </div>
          ))}
        </div>
        {post.imageUrls && post.imageUrls.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                }}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-8 h-8 items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            {currentImageIndex < post.imageUrls.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                }}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-8 h-8 items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {post.imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
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
        {!isOwnPost && (
          <div>
            <div className="flex gap-[4px] m-[8px] items-center">
              <PinButton
                postId={post.id}
                pinsCount={post.pinsCount}
                pinnedByMe={post.pinnedByMe}
              />
            </div>
          </div>
        )}
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
