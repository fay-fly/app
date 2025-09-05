"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Notification, User, Post } from "@prisma/client";
import PageLoader from "@/components/PageLoader";
import NotificationItem from "@/app/(public)/post/[id]/components/NotificationItem";

export type NotificationWithRelations = Notification & {
  sender: User;
  receiver: User;
  post: Post | null;
};

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<NotificationWithRelations[]>();

  useEffect(() => {
    axios
      .get<NotificationWithRelations[]>(`/api/notifications/get`)
      .then((response) => {
        setNotifications(response.data);
      });
  }, []);

  return (
    <>
      {!notifications ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col justify-center mr-auto ml-auto max-w-[612px] gap-[24px] px-[16px] md:px-[16px]">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </>
  );
}
