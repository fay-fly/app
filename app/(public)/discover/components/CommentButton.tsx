import Comments from "@/icons/Comments";
import { useEffect, useRef, useState } from "react";
import ReactModal from "react-modal";
import { Comment } from "@prisma/client";
import axios from "axios";
import {CommentWithUser, User} from "@/app/types/postWithUser";
import {CommentList} from "@/components/comments/CommentList";
import {CommentForm} from "@/components/comments/CommentForm";

type CommentButtonProps = {
  commentsCount: number;
  postId: number;
};

type CommentsWithUser = Comment & {
  author: User;
};

export default function CommentButton({
  commentsCount,
  postId,
}: CommentButtonProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [comments, setComments] = useState<CommentsWithUser[]>([]);

  useEffect(() => {
    setProcessing(true);
    axios
      .get<CommentsWithUser[]>(`/api/comments/get?postId=${postId}`)
      .then((response) => {
        setComments(response.data);
      })
      .finally(() => setProcessing(false));
  }, []);

  useEffect(() => {
    if (commentsRef.current) {
      const commentsDivScrollHeight = commentsRef.current.scrollHeight;
      if (commentsDivScrollHeight) {
        commentsRef.current.scrollTop = commentsDivScrollHeight;
      }
    }
  }, [comments]);

  const onCommentAdded = (newComment: CommentWithUser) => {
    setComments((prev) => {
      const update = [...(prev ?? [])];
      update.push(newComment);
      return update;
    });
  };

  return (
    <>
      <div
        className="flex gap-[4px] m-[8px] items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Comments />
        {comments.length > 0 ? comments.length : commentsCount}
      </div>
      <ReactModal
        isOpen={open}
        ariaHideApp={false}
        shouldFocusAfterRender={false}
        onRequestClose={() => setOpen(false)}
        className="m-0 bg-(--fly-white)"
        style={{
          overlay: {
            backgroundColor: "rgba(50, 50, 50, 0.70)",
          },
          content: {
            position: "absolute",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "100%",
          },
        }}
      >
        <div
          ref={commentsRef}
          className="flex flex-col max-h-[300px] overflow-scroll"
        >
          <CommentList comments={comments} />
        </div>
        <CommentForm postId={postId} onCommentAdded={onCommentAdded} disabled={processing} />
      </ReactModal>
    </>
  );
}
