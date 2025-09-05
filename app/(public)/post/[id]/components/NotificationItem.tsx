import React from "react";
import Link from "next/link";
import clsx from "clsx";
import Verified from "@/icons/Verified";

type User = {
  id: number;
  username?: string | null;
  pictureUrl?: string | null;
};

type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "PIN";

type NotificationItemProps = {
  notification: {
    id: number;
    type: NotificationType;
    message: string;
    sender: User;
    senderId: number;
    post?: {
      id: number;
      imageUrl: string;
    } | null;
  };
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const senderAvatar = (
    <>
      <Link
        href={`/profile/${notification.senderId}`}
        className="w-[32px] h-[32px] cursor-pointer"
      >
        {notification.sender.pictureUrl ? (
          <img
            src={notification.sender.pictureUrl}
            alt="profile picture"
            className="rounded-full"
          />
        ) : (
          <div
            className={clsx(
              "w-full h-full bg-(--fly-primary) flex",
              "justify-center items-center text-(--fly-white) rounded-full"
            )}
          >
            {notification.sender.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
    </>
  );

  const content = (
    <div className="flex items-center gap-[8px]">
      {senderAvatar}
      <div className="flex flex-col">
        <Link
          href={`/profile/${notification.sender.username}`}
          className="flex text-[#5B5B5B] font-bold"
        >
          {notification.sender.username} <Verified />
        </Link>
        <div className="text-[#5B5B5B]">{notification.message}</div>
      </div>
    </div>
  );

  return (
    <div className="flex justify-between flex-1">
      {content}
      {notification.post && (
        <a href={`/post/${notification.post.id}`} className="flex items-center ml-4">
          <img
            src={notification.post.imageUrl}
            alt="post"
            className="w-10 h-10 object-cover"
          />
        </a>
      )}
    </div>
  );
};

export default NotificationItem;
