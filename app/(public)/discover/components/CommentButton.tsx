import Comments from "@/icons/Comments";
import { useState } from "react";
import PostPreviewModal from "@/components/PostPreviewModal";
import { PostWithUser } from "@/app/types/postWithUser";

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
        className="flex gap-[4px] m-[8px] items-center cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Comments />
        {commentsCount}
      </div>
      <PostPreviewModal
        open={open}
        onRequestClose={() => setOpen(false)}
        post={post}
      />
    </>
  );
}
