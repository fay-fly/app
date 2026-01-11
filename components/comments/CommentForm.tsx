import React, { FormEvent, useState } from "react";
import axios from "axios";
import { CommentWithUser } from "@/types/postWithUser";
import { handleError } from "@/utils/errors";
import clsx from "clsx";
import { useSafeSession } from "@/hooks/useSafeSession";
import Send from "@/icons/Send";
import SafeNextImage from "@/components/SafeNextImage";

type CommentFormProps = {
  postId: number;
  onCommentAdded?: (newComment: CommentWithUser) => void;
  disabled?: boolean;
};

export function CommentForm({
  postId,
  onCommentAdded,
  disabled,
}: CommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const { session } = useSafeSession();

  if (!session) {
    return null;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment === "" || disabled) return;

    const formData = new FormData();
    formData.append("text", newComment);
    formData.append("postId", postId.toString());

    try {
      setProcessing(true);
      const response = await axios.post("/api/comments/create", formData);
      if (response.data?.comment && onCommentAdded) {
        onCommentAdded(response.data.comment);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setNewComment("");
      setProcessing(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-[8px] h-[56px] items-center px-[16px] py-[8px] border-t border-[#ededed]"
    >
      <div className="w-[32px] h-[32px] flex-shrink-0">
        {session?.user.image ? (
          <SafeNextImage
            src={session?.user.image}
            alt="profile image"
            className="rounded-full w-[32px] h-[32px] object-cover"
            width={32}
            height={32}
            errorSize="small"
            showErrorText={false}
            sizes="32px"
          />
        ) : (
          <div
            className={clsx(
              "w-full h-full bg-[#9da6ff] flex",
              "justify-center items-center text-[#f9f9f9] rounded-full font-semibold text-[16px] tracking-[-0.16px]"
            )}
          >
            {session?.user.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment"
        disabled={processing || !!disabled}
        className="flex-1 text-[16px] text-[#343434] leading-[22px] placeholder:text-[#a0a0a0] outline-none bg-transparent"
      />
      <button
        type="submit"
        disabled={processing || !!disabled || !newComment.trim()}
        className={clsx(
          "w-[32px] h-[32px] rounded-full flex justify-center items-center cursor-pointer transition-colors",
          newComment.trim() ? "bg-[#7c89ff] text-white" : "bg-[#F7F8FF] text-[#7c89ff]"
        )}
      >
        <Send />
      </button>
    </form>
  );
}
