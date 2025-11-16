import Image from "next/image";
import Close from "@/icons/Close";
import UserText from "@/app/(public)/components/UserText";
import { getFormattedDate } from "@/utils/dates";
import { CommentList } from "@/components/comments/CommentList";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import Comments from "@/icons/Comments";
import PinButton from "@/app/(public)/discover/components/PinButton";
import { CommentForm } from "@/components/comments/CommentForm";
import ReactModal from "react-modal";
import { CommentWithUser, PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import UserCard from "@/app/(public)/components/UserCard";
import ChevronLeft from "@/icons/ChevronLeft";
import ChevronRight from "@/icons/ChevronRight";
import FireFilled from "@/icons/FireFilled";

type PostPreviewModalProps = {
  open: boolean;
  post: PostWithUser;
  onRequestClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
};

export default function PostPreviewModal(props: PostPreviewModalProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(false);
  const likeButtonRef = useRef<{ triggerLike: () => void }>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

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
    if (props.post.id) {
      setComments([]);
      setProcessing(true);
      shouldAutoScrollRef.current = false;
      if (commentsRef.current) {
        commentsRef.current.scrollTop = 0;
      }
      axios
        .get<CommentWithUser[]>(`/api/comments/get?postId=${props.post.id}`)
        .then((response) => {
          setComments(response.data);
        })
        .finally(() => setProcessing(false));
    }
  }, [props.post.id]);

  const onCommentAdded = (newComment: CommentWithUser) => {
    shouldAutoScrollRef.current = true;
    setComments((prev) => {
      const update = [...(prev ?? [])];
      update.push(newComment);
      return update;
    });
  };

  const handleImageDoubleClick = () => {
    likeButtonRef.current?.triggerLike();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
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
      <div className="relative flex items-center w-full h-full lg:w-auto lg:h-auto lg:max-h-[90vh]">
        {props.showNavigation && props.onPrevious && (
          <button
            onClick={props.onPrevious}
            className="hidden lg:block absolute left-[-60px] w-10 h-10 rounded-full bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors z-10"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft />
          </button>
        )}
        <div className="flex w-full h-full lg:w-auto lg:h-auto lg:max-h-[90vh] lg:max-w-[calc(100vw-120px)]">
          <div
            className="relative justify-center items-center bg-black hidden lg:flex w-[900px] max-w-[calc(100vw-620px)] max-h-[90vh] aspect-square cursor-pointer select-none"
            onDoubleClick={handleImageDoubleClick}
          >
            <Image
              src={props.post.imageUrl}
              alt="image"
              className="w-full h-full object-contain"
              unoptimized
              width={1}
              height={1}
            />
            {showLikeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-like-burst">
                  <FireFilled className="w-[100px] h-[100px] text-[#FF6B6B] drop-shadow-[0_0_20px_rgba(255,107,107,0.8)]" />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col w-full lg:w-[500px] lg:min-w-[400px] h-full lg:h-[90vh] lg:max-h-[90vh]">
            <div className="flex justify-between items-center px-[16px] py-[8px] border-b-1 border-(--fly-border-color) flex-shrink-0">
              <UserCard
                user={{
                  username: props.post.author.username,
                  image: props.post.author.pictureUrl,
                }}
                showStatus={false}
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
            className="hidden lg:block absolute right-[-60px] w-10 h-10 rounded-full bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors z-10"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </ReactModal>
  );
}
