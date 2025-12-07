import React from "react";
import Link from "next/link";
import { Comment } from "@prisma/client";
import { User } from "@/types/postWithUser";
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
          <Link
            href={`/profile/${comment.author.username}`}
            className="inline-flex w-[32px] h-[32px] cursor-pointer flex-shrink-0"
          >
            {comment.author.pictureUrl ? (
              <img
                src={comment.author.pictureUrl}
                alt="profile image"
                className="rounded-full w-full h-full object-cover"
              />
            ) : (
              <span
                className={clsx(
                  "w-full h-full bg-(--fly-primary) flex",
                  "justify-center items-center text-(--fly-white) rounded-full"
                )}
              >
                {comment.author.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
          <div className="flex flex-col flex-1">
            <Link
              href={`/profile/${comment.author.username}`}
              className="font-semibold text-[#343434] w-fit"
            >
              {comment.author.username}
            </Link>
            <UserText postText={comment.text} />
          </div>
        </div>
      ))}
    </>
  );
}
