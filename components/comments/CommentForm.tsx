import React, { FormEvent, useState } from "react";
import axios from "axios";
import {CommentWithUser} from "@/app/types/postWithUser";
import {handleError} from "@/utils/errors";
import clsx from "clsx";
import {useSafeSession} from "@/hooks/useSafeSession";
import Send from "@/icons/Send";

type CommentFormProps = {
  postId: number;
  onCommentAdded?: (newComment: CommentWithUser) => void;
  disabled?: boolean;
};

export function CommentForm({ postId, onCommentAdded, disabled }: CommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const { session } = useSafeSession();

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
    } catch(error) {
      handleError(error);
    } finally {
      setNewComment("");
      setProcessing(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-[8px] border-t-[1px] border-(--fly-border-color) px-[16px] py-[8px]"
    >
      <div className="w-[32px] h-[32px]">
        <div className="w-[32px] h-[32px]">
          {session?.user.image ? (
            <img
              src={session?.user.image}
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
              {session?.user.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        cols={30}
        rows={1}
        placeholder="Comment"
        disabled={processing || !!disabled}
        className="flex-1"
      ></textarea>
      <button
        type="submit"
        disabled={processing || !!disabled}
        className="bg-[#F7F8FF] w-[32px] h-[32px] rounded-full flex justify-center items-center cursor-pointer"
      >
        <Send />
      </button>
    </form>
  );
}