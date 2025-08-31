import clsx from "clsx";
import type { PostWithUser } from "@/app/types/postWithUser";
import PostPreview from "@/app/(public)/components/Post";
import { useEffect, useRef, useState } from "react";
import useScreenWidth from "@/hooks/useScreenWidth";
import ReactModal from "react-modal";
import Verified from "@/icons/Verified";
import {getFormattedDate} from "@/utils/dates";
import Close from "@/icons/Close";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import Image from "next/image";
import PostText from "@/app/(public)/components/PostText";
import CommentButton from "@/app/(public)/discover/components/CommentButton";
import PinButton from "@/app/(public)/discover/components/PinButton";

type PostPreviewProps = {
  className?: string;
  posts: PostWithUser[];
};

export default function PostsPreview({ posts, className }: PostPreviewProps) {
  const width = useScreenWidth();
  const isMobile = width !== null && width < 768;
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [postIdToPreview, setPostIdToPreview] = useState<number>();
  const [previewMode, setPreviewMode] = useState("imagesList");
  const [open, setOpen] = useState(false);

  const onPreviewOpen = (id: number) => {
    setPostIdToPreview(id);
    if (isMobile) {
      setPreviewMode("feed");
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    if (!postIdToPreview) {
      return;
    }

    if (isMobile) {
      if (
        previewMode === "feed" &&
        postIdToPreview &&
        postRefs.current[postIdToPreview]
      ) {
        const element = postRefs.current[postIdToPreview];
        const yOffset = -56;
        const y = element!.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, })
      }
    }
  }, [isMobile, postIdToPreview, previewMode]);

  const postToPreview = posts.find(post => post.id === postIdToPreview);

  return (
    <>
      {previewMode === "imagesList" ? (
        <div className={clsx("grid grid-cols-3 gap-[2px] relative", className)}>
          {posts.map((post) => {
            return (
              <div
                key={post.id}
                className="w-full aspect-square overflow-hidden bg-gray-100 relative h-full"
              >
                <Image
                  src={post.imageUrl}
                  alt="publication"
                  className="w-full h-full object-cover"
                  width={1}
                  height={1}
                  unoptimized
                />
                <div
                  className={clsx(
                    "relative top-0 left-0 w-full h-full bg-black bg-opacity-50 opacity-0",
                    "hover:opacity-70 transition-opacity duration-100 cursor-pointer"
                  )}
                  onClick={() => onPreviewOpen(post.id)}
                ></div>
              </div>
            );
          })}
        </div>
      ) : previewMode === "feed" ? (
        posts.map((post) => {
          return (
            <div
              key={post.id}
              ref={(el) => {
                postRefs.current[post.id] = el;
              }}
            >
              <PostPreview post={post} />
            </div>
          );
        })
      ) : null}
      {postToPreview && <ReactModal
          isOpen={open}
          ariaHideApp={false}
          shouldFocusAfterRender={false}
          onRequestClose={() => setOpen(false)}
          className="bg-white overflow-hidden border-0"
          style={{
            overlay: {
              backgroundColor: 'rgba(50, 50, 50, 0.70)',
            },
            content: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              borderRadius: '8px',
            },
          }}
      >
          <div className="flex justify-between items-center px-[16px] py-[8px] border-b-1 border-(--fly-border-color)">
              <div className="flex gap-[8px] items-center">
                  <div className="w-[32px] h-[32px]">
                      <div
                          className={clsx(
                            "w-full h-full bg-(--fly-primary) flex",
                            "justify-center items-center text-(--fly-white) rounded-full"
                          )}
                      >
                        {postToPreview.author.username.charAt(0).toUpperCase()}
                      </div>
                  </div>
                  <a
                      href={`/profile/${postToPreview.author.id}`}
                      className="text-(--fly-text-primary) font-semibold"
                  >
                    {postToPreview.author.username}
                  </a>
                  <Verified/>
              </div>
              <button onClick={() => setOpen(false)} className="cursor-pointer">
                  <Close />
              </button>
          </div>
          <div className="flex">
              <Image src={postToPreview.imageUrl} alt="image" className="max-h-[612px] max-w-[612px] w-full h-full" unoptimized width={1} height={1} />
              <div className="min-w-[318px]">
                  <PostText postText={postToPreview.text} username={postToPreview.author.username} />
                  <div className="px-[16px] text-[#A0A0A0]">
                    {getFormattedDate(postToPreview.createdAt)}
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                      <div className="flex">
                          <LikeButton postId={postToPreview.id} likesCount={postToPreview.likesCount} likedByMe={postToPreview.likedByMe} />
                          <CommentButton commentsCount={postToPreview.commentsCount} postId={postToPreview.id} />
                      </div>
                      <div>
                          <div className="flex gap-[4px] m-[8px] items-center">
                            <PinButton postId={postToPreview.id} pinsCount={postToPreview.pinsCount} pinnedByMe={postToPreview.pinnedByMe}/>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </ReactModal>}
    </>
  );
}
