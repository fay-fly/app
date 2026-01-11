import Comments from "@/icons/Comments";
import { useState } from "react";
import PostPreviewModal from "@/components/PostPreviewModal";
import { PostWithUser } from "@/types/postWithUser";

type CommentButtonProps = {
  commentsCount: number;
  post: PostWithUser;
};

export default function CommentButton({
  commentsCount,
  post,
}: CommentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center justify-center gap-[4px] h-[40px] p-[8px] cursor-pointer select-none text-[#a0a0a0]"
        onClick={() => setOpen(true)}
      >
        <Comments />
        <span className="text-[14px] font-medium tracking-[-0.42px] leading-[22px]">{commentsCount}</span>
      </div>
      <PostPreviewModal
        open={open}
        onRequestClose={() => setOpen(false)}
        post={post}
      />
    </>
  );
}
