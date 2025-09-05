"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Notification, User, Post } from "@prisma/client";
import PageLoader from "@/components/PageLoader";
import NotificationItem from "@/app/(public)/post/[id]/components/NotificationItem";
import clsx from "clsx";

export type NotificationWithRelations = Notification & {
  sender: User;
  receiver: User;
  post: Post | null;
  read: boolean;
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

  useEffect(() => {
    let marked = false;

    const markAllRead = async () => {
      await axios.post("/api/notifications/mark-read");
      marked = true;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markAllRead();
      }
    };

    const handleBeforeUnload = () => {
      markAllRead();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (!marked) {
        markAllRead();
      }
    };
  }, []);


  return (
    <>
      {!notifications ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col justify-center mr-auto ml-auto max-w-[612px] gap-1 px-[16px] md:px-[16px] mt-5">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={clsx(!notification.read && "bg-[#7c89ff21]", "flex items-center gap-2 py-2 px-3")}
            >
              <span
                className={clsx(
                  "w-[8px] h-[8px] rounded-full",
                  "bg-[#19b4f7]",
                  notification.read && "opacity-0"
                )}
              />
              <NotificationItem notification={notification} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
