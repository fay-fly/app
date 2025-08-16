import Comments from "@/icons/Comments";
import {FormEvent, useEffect, useState} from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import { Comment } from '@prisma/client';
import axios from "axios";
import {User} from "@/app/types/postWithUser";
import {handleError} from "@/utils/errors";
import clsx from "clsx";
import {useSafeSession} from "@/hooks/useSafeSession";

type CommentButtonProps = {
  commentsCount: number,
  postId: number,
}

type CommentsWithUser = Comment & {
  author: User
};

export default function CommentButton({ commentsCount, postId }: CommentButtonProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentsWithUser[]>([]);
  const { session } = useSafeSession();

  useEffect(() => {
    axios.get<CommentsWithUser[]>(`/api/comments/get?postId=${postId}`).then((response) => {
      setComments(response.data);
    });
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("postId", postId.toString());
    try {
      const response = await axios.post("/api/comments/create", formData);
      console.log(response.data);
      setComments(prev => {
        const update = [...(prev ?? [])];
        update.push(response.data.comment);
        return update;
      })
    } catch (error) {
      handleError(error);
    }
  }

  return <>
    <div className="flex gap-[4px] m-[8px] items-center cursor-pointer" onClick={() => setOpen((prev) => !prev)}>
      <Comments/>
      {commentsCount}
    </div>
    <ReactModal
      isOpen={open}
      ariaHideApp={false}
      shouldFocusAfterRender={false}
      onRequestClose={() => setOpen(false)}
    >
      <div className="flex flex-col gap-3">
        {comments.map((comment) => {
          return <div key={comment.id} className="flex gap-2">
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
      <form onSubmit={onSubmit} className="flex">
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
        <textarea name="text" cols={30} rows={10}></textarea>
        <Button type="submit" className="bg-(--fly-bg-primary) border-2 border-[#A0A0A0] rounded-full cursor-pointer">Comment</Button>
      </form>
    </ReactModal>
  </>
}