import React from "react";
import Link from "next/link";

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

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const senderAvatar = (
    <div className="w-[32px] h-[32px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
      {notification.sender.pictureUrl ? (
        <img src={notification.sender.pictureUrl} alt="sender" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-white">
          {notification.sender.username?.charAt(0).toUpperCase() ?? "U"}
        </span>
      )}
    </div>
  );

  const content = (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        {senderAvatar}
        <div className="flex flex-col">
          <Link href={`/profile/${notification.senderId}`} className="text-sm font-bold text-gray-800">
            {notification.sender.username}
          </Link>
          <span className="text-xs text-gray-600">{notification.message}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-white">
      {content}
      {notification.post && (
        <a href={`/post/${notification.post.id}`} className="ml-4">
          <img src={notification.post.imageUrl} alt="post" className="w-10 h-10 object-cover" />
        </a>
      )}
    </div>
  );
};

export default NotificationItem;