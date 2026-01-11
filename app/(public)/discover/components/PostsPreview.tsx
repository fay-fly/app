import clsx from "clsx";
import { PostWithUser } from "@/types/postWithUser";
import PostPreview from "@/app/(public)/components/Post";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import useScreenWidth from "@/hooks/useScreenWidth";
import PostPreviewModal from "@/components/PostPreviewModal";
import MultiplePhotos from "@/icons/MultiplePhotos";
import SafeNextImage from "@/components/SafeNextImage";

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

  const onPreviewOpen = useCallback((id: number) => {
    setPostIdToPreview(id);
    if (isMobile) {
      setPreviewMode("feed");
    } else {
      setOpen(true);
    }
  }, [isMobile]);

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
        const y =
          element!.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y });
      }
    }
  }, [isMobile, postIdToPreview, previewMode]);

  const currentPostIndex = useMemo(
    () => posts.findIndex((post) => post.id === postIdToPreview),
    [posts, postIdToPreview]
  );

  const postToPreview = useMemo(
    () => posts[currentPostIndex],
    [posts, currentPostIndex]
  );

  const handleNext = useCallback(() => {
    if (currentPostIndex < posts.length - 1) {
      setPostIdToPreview(posts[currentPostIndex + 1].id);
    }
  }, [currentPostIndex, posts]);

  const handlePrevious = useCallback(() => {
    if (currentPostIndex > 0) {
      setPostIdToPreview(posts[currentPostIndex - 1].id);
    }
  }, [currentPostIndex, posts]);

  const handleCloseModal = useCallback(() => {
    setOpen(false);
  }, []);

  const gridContent = useMemo(
    () => (
      <div className={clsx("grid grid-cols-3 gap-[2px]", className)}>
        {posts.map((post) => {
          const primaryMedia = post.media?.[0];
          const hasMultiple = (post.media?.length ?? 0) > 1;
          return (
            <div
              key={post.id}
              className="w-full aspect-square overflow-hidden bg-gray-100 relative h-full"
            >
              {primaryMedia ? (
                <SafeNextImage
                  src={primaryMedia.smallUrl || primaryMedia.url}
                  alt="publication"
                  className="w-full h-full object-cover"
                  errorSize="small"
                  showErrorText={false}
                  sizes="(max-width: 768px) 33vw, 400px"
                  width={400}
                  height={400}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              {hasMultiple && (
                <div className="absolute top-[8px] right-[8px]">
                  <MultiplePhotos className="w-[24px] h-[24px] text-white" />
                </div>
              )}
              <div
                className={clsx(
                  "absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 opacity-0",
                  "hover:opacity-70 transition-opacity duration-100 cursor-pointer"
                )}
                onClick={() => onPreviewOpen(post.id)}
              ></div>
            </div>
          );
        })}
      </div>
    ),
    [posts, className, onPreviewOpen]
  );

  return (
    <>
      {previewMode === "imagesList" ? (
        gridContent
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
      {postToPreview && (
        <PostPreviewModal
          open={open}
          post={postToPreview}
          onRequestClose={handleCloseModal}
          showNavigation={true}
          onNext={currentPostIndex < posts.length - 1 ? handleNext : undefined}
          onPrevious={currentPostIndex > 0 ? handlePrevious : undefined}
        />
      )}
    </>
  );
}
