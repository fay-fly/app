import Close from "@/icons/Close";
import UserText from "@/app/(public)/components/UserText";
import { getFormattedDate } from "@/utils/dates";
import { CommentList } from "@/components/comments/CommentList";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import Comments from "@/icons/Comments";
import PinButton from "@/app/(public)/discover/components/PinButton";
import { CommentForm } from "@/components/comments/CommentForm";
import ReactModal from "react-modal";
import { CommentWithUser, HydratedPostWithUser } from "@/types/postWithUser";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import UserCard from "@/app/(public)/components/UserCard";
import ChevronLeft from "@/icons/ChevronLeft";
import ChevronRight from "@/icons/ChevronRight";
import FireFilled from "@/icons/FireFilled";
import Verified from "@/icons/Verified";
import { hasVerifiedBadge } from "@/lib/permissions";
import MediaCarousel from "@/components/media/MediaCarousel";

type PostPreviewModalProps = {
  open: boolean;
  post: HydratedPostWithUser;
  onRequestClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
};

export default function PostPreviewModal(props: PostPreviewModalProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(false);
  const likeButtonRef = useRef<{ triggerLike: () => void }>(null);
  const commentsCacheRef = useRef<Map<number, CommentWithUser[]>>(new Map());
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mediaItems = props.post.media ?? [];

  useEffect(() => {
    if (shouldAutoScrollRef.current && commentsRef.current) {
      const commentsDivScrollHeight = commentsRef.current.scrollHeight;
      if (commentsDivScrollHeight) {
        commentsRef.current.scrollTop = commentsDivScrollHeight;
      }
      shouldAutoScrollRef.current = false;
    }
  }, [comments]);

  useEffect(() => {
    const postId = props.post.id;
    if (!props.open || !postId) {
      return;
    }

    setCurrentImageIndex(0);
    shouldAutoScrollRef.current = false;
    if (commentsRef.current) {
      commentsRef.current.scrollTop = 0;
    }

    const cachedComments = commentsCacheRef.current.get(postId);
    if (cachedComments) {
      setComments(cachedComments);
      setProcessing(false);
      return;
    }

    setComments([]);
    setProcessing(true);

    let cancelled = false;

    axios
      .get<CommentWithUser[]>(`/api/comments/get?postId=${postId}`)
      .then((response) => {
        if (cancelled) {
          return;
        }
        commentsCacheRef.current.set(postId, response.data);
        setComments(response.data);
      })
      .finally(() => {
        if (!cancelled) {
          setProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [props.open, props.post.id]);

  const onCommentAdded = (newComment: CommentWithUser) => {
    shouldAutoScrollRef.current = true;
    setComments((prev) => {
      const update = [...(prev ?? [])];
      update.push(newComment);
      commentsCacheRef.current.set(props.post.id, update);
      return update;
    });
  };

  const handleImageDoubleClick = () => {
    likeButtonRef.current?.triggerLike();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleMediaSlideChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    if (!props.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.onRequestClose();
      } else if (props.showNavigation) {
        if (e.key === "ArrowLeft" && props.onPrevious) {
          props.onPrevious();
        } else if (e.key === "ArrowRight" && props.onNext) {
          props.onNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    props.open,
    props.showNavigation,
    props.onNext,
    props.onPrevious,
    props.onRequestClose,
  ]);

  useEffect(() => {
    if (props.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [props.open]);

  return (
    <ReactModal
      isOpen={props.open}
      ariaHideApp={false}
      shouldFocusAfterRender={false}
      onRequestClose={props.onRequestClose}
      className="w-full h-full md:w-auto md:h-auto bg-white"
      style={{
        overlay: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(50, 50, 50, 0.70)",
          zIndex: 100,
        },
        content: {
          top: "auto",
          left: "auto",
          right: "auto",
          bottom: "auto",
          padding: 0,
          borderRadius: 0,
          border: "none",
          zIndex: 100,
        },
      }}
    >
      <div className="relative flex h-full w-full flex-col lg:h-auto lg:w-auto lg:max-h-[90vh]">
        {props.showNavigation && props.onPrevious && (
          <button
            onClick={props.onPrevious}
            className="absolute left-[-60px] top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-800 transition-colors hover:bg-gray-100 lg:flex z-10"
            style={{ cursor: "pointer" }}
            aria-label="Previous post"
          >
            <ChevronLeft />
          </button>
        )}
        <div className="flex w-full flex-1 flex-col lg:w-auto lg:flex-row lg:max-h-[90vh] lg:max-w-[calc(100vw-120px)]">
          <div className="flex w-full items-center justify-center bg-black overflow-hidden lg:w-[900px] lg:max-w-[calc(100vw-620px)] lg:max-h-[90vh]">
            {mediaItems.length > 0 ? (
              <MediaCarousel
                className="w-full"
                media={mediaItems}
                currentIndex={currentImageIndex}
                onChange={handleMediaSlideChange}
                onDoubleClick={handleImageDoubleClick}
                ariaLabel={`${props.post.author.username}'s media carousel`}
                rounded={false}
              >
                {showLikeAnimation && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="animate-like-burst">
                      <FireFilled className="h-[100px] w-[100px] text-[#FF6B6B] drop-shadow-[0_0_20px_rgba(255,107,107,0.8)]" />
                    </div>
                  </div>
                )}
              </MediaCarousel>
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-white/70">
                No media
              </div>
            )}
          </div>
          <div className="flex h-full w-full flex-col lg:h-[90vh] lg:max-h-[90vh] lg:min-w-[400px] lg:w-[500px]">
            <div className="flex justify-between items-center px-[16px] py-[8px] border-b-1 border-(--fly-border-color) flex-shrink-0">
              <UserCard
                user={{
                  username: props.post.author.username,
                  image: props.post.author.pictureUrl,
                  role: props.post.author.role,
                }}
                showStatus={false}
                clickable={true}
                disableHoverUnderline={true}
              />
              <button
                onClick={() => props.onRequestClose()}
                className="cursor-pointer"
              >
                <Close />
              </button>
            </div>
            <div ref={commentsRef} className="flex-1 overflow-auto min-h-0">
              <p className="px-[8px] text-[#5B5B5B] whitespace-pre-wrap overflow-auto">
                <span className="font-semibold">
                  {props.post.author.username}
                </span>{" "}
                <UserText postText={props.post.text} />
              </p>
              <div className="px-[8px] text-[#A0A0A0]">
                {getFormattedDate(props.post.createdAt)}
              </div>
              {processing ? (
                <>
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="flex gap-2 px-[16px] py-[8px] animate-pulse"
                    >
                      <div className="w-[32px] h-[32px] bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex flex-col flex-1 gap-1">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <CommentList comments={comments} />
              )}
            </div>
            <div className="flex justify-between text-[#A0A0A0] flex-shrink-0 border-t border-(--fly-border-color)">
              <div className="flex">
                <LikeButton
                  ref={likeButtonRef}
                  postId={props.post.id}
                  likesCount={props.post.likesCount}
                  likedByMe={props.post.likedByMe}
                />
                <div className="flex gap-[4px] m-[8px] items-center cursor-pointer">
                  <Comments />
                  {props.post.commentsCount}
                </div>
              </div>
              <div>
                <div className="flex gap-[4px] m-[8px] items-center">
                  <PinButton
                    postId={props.post.id}
                    pinsCount={props.post.pinsCount}
                    pinnedByMe={props.post.pinnedByMe}
                  />
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <CommentForm
                postId={props.post.id}
                disabled={processing}
                onCommentAdded={onCommentAdded}
              />
            </div>
          </div>
        </div>
        {props.showNavigation && props.onNext && (
          <button
            onClick={props.onNext}
            className="absolute right-[-60px] top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-800 transition-colors hover:bg-gray-100 lg:flex z-10"
            style={{ cursor: "pointer" }}
            aria-label="Next post"
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </ReactModal>
  );
}
