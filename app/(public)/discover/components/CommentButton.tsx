import Comments from "@/icons/Comments";
import {FormEvent, useEffect, useRef, useState} from "react";
import ReactModal from "react-modal";
import { Comment } from '@prisma/client';
import axios from "axios";
import {User} from "@/app/types/postWithUser";
import {handleError} from "@/utils/errors";
import clsx from "clsx";
import {useSafeSession} from "@/hooks/useSafeSession";
import Send from "@/icons/Send";

type CommentButtonProps = {
  commentsCount: number,
  postId: number,
}

type CommentsWithUser = Comment & {
  author: User
};

export default function CommentButton({ commentsCount, postId }: CommentButtonProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentsWithUser[]>([]);
  const { session } = useSafeSession();

  useEffect(() => {
    axios.get<CommentsWithUser[]>(`/api/comments/get?postId=${postId}`).then((response) => {
      setComments(response.data);
    });
  }, []);

  useEffect(() => {
    if (commentsRef.current) {
      const commentsDivScrollHeight = commentsRef.current.scrollHeight;
      if (commentsDivScrollHeight) {
        commentsRef.current.scrollTop = commentsDivScrollHeight;
      }
    }
  }, [comments]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("text", newComment);
    formData.append("postId", postId.toString());
    try {
      const response = await axios.post("/api/comments/create", formData);
      setComments(prev => {
        const update = [...(prev ?? [])];
        update.push(response.data.comment);
        return update;
      })
    } catch (error) {
      handleError(error);
    } finally {
      setNewComment("");
    }
  }

  return <>
    <div className="flex gap-[4px] m-[8px] items-center cursor-pointer" onClick={() => setOpen((prev) => !prev)}>
      <Comments/>
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
          backgroundColor: 'rgba(50, 50, 50, 0.70)'
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
      <div ref={commentsRef} className="flex flex-col max-h-[300px] overflow-scroll">
        {comments.map((comment) => {
          return <div key={comment.id} className="flex gap-2 px-[16px] py-[8px]">
            <div className="w-[32px] h-[32px] relative cursor-pointer">
              <div
                className={clsx(
                  "w-full h-full bg-(--fly-primary) flex",
                  "justify-center items-center text-(--fly-white) rounded-full"
                )}
              >
                {comment.author.username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col">
              <strong>{comment.author.username}</strong>
              <span>{comment.text}</span>
            </div>
          </div>
        })}
      </div>
      <form onSubmit={onSubmit} className="flex gap-[8px] border-t-[1px] border-(--fly-border-color) px-[16px] py-[8px]">
        <div className="w-[32px] h-[32px] relative">
          <div
            className={clsx(
              "w-full h-full bg-(--fly-primary) flex",
              "justify-center items-center text-(--fly-white) rounded-full"
            )}
          >
            {session?.user.username?.charAt(0).toUpperCase()}
          </div>
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          cols={30} rows={1}
          placeholder="Comment"
        ></textarea>
        <button
          type="submit"
          className="bg-[#F7F8FF] w-[32px] h-[32px] rounded-full flex justify-center items-center cursor-pointer"
        >
          <Send />
        </button>
      </form>
    </ReactModal>
  </>
}