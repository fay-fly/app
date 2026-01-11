import React from "react";
import Link from "next/link";
import { Comment } from "@prisma/client";
import { User } from "@/types/postWithUser";
import UserText from "@/app/(public)/components/UserText";
import clsx from "clsx";
import Verified from "@/icons/Verified";
import { hasVerifiedBadge } from "@/lib/permissions";
import SafeNextImage from "@/components/SafeNextImage";
import { getRelativeTime } from "@/utils/dates";

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
        <div key={comment.id} className="flex gap-[8px] items-start px-[16px] py-[10px]">
          <Link
            href={`/profile/${comment.author.username}`}
            className="inline-flex w-[32px] h-[32px] cursor-pointer flex-shrink-0 relative"
          >
            {comment.author.pictureUrl ? (
              <SafeNextImage
                src={comment.author.pictureUrl}
                alt="profile image"
                className="rounded-full w-full h-full object-cover"
                width={32}
                height={32}
                errorSize="small"
                showErrorText={false}
                sizes="32px"
              />
            ) : (
              <span
                className={clsx(
                  "w-full h-full bg-[#9da6ff] flex",
                  "justify-center items-center text-[#f9f9f9] rounded-full font-semibold text-[16px] tracking-[-0.16px]"
                )}
              >
                {comment.author.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center w-full">
              <div className="flex items-center flex-1 min-w-0">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="font-semibold text-[14px] text-[#343434] tracking-[-0.14px] leading-[22px]"
                >
                  {comment.author.username}
                </Link>
                {hasVerifiedBadge(comment.author.role) && (
                  <Verified className="w-[16px] h-[16px]" />
                )}
              </div>
              <span className="text-[12px] text-[#a0a0a0] tracking-[0.12px] leading-[14px] flex-shrink-0">
                {getRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-[14px] text-[#5b5b5b] tracking-[-0.14px] leading-[20px] whitespace-pre-wrap">
              <UserText postText={comment.text} />
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
