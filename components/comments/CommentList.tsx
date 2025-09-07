import React from "react";
import { Comment } from "@prisma/client";
import { User } from "@/app/types/postWithUser";
import UserText from "@/app/(public)/components/UserText";
import clsx from "clsx";

type CommentWithUser = Comment & {
  author: User;
};

type CommentListProps = {
  comments: CommentWithUser[];
};

export function CommentList({ comments }: CommentListProps) {
  return (
    <>
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2 px-[16px] py-[8px]">
          <div className="w-[32px] h-[32px] cursor-pointer">
            {comment.author.pictureUrl ? (
              <img
                src={comment.author.pictureUrl}
                alt="profile image"
                className="rounded-full"
              />
            ) : (
              <div
                className={clsx(
                  "w-full h-full bg-(--fly-primary) flex",
                  "justify-center items-center text-(--fly-white) rounded-full"
                )}
              >
                {comment.author.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1">
            <strong>{comment.author.username}</strong>
            <UserText postText={comment.text} />
          </div>
        </div>
      ))}
    </>
  );
}