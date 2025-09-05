"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Notification, User, Post } from "@prisma/client";
import clsx from "clsx";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";
import Verified from "@/icons/Verified";

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
          {notifications.map((notification) => {
            return (
              <div key={notification.id} className="flex flex-col">
                {notification.type === "LIKE" && (
                  <div className="flex justify-between">
                    <div className="flex items-center gap-[8px]">
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
                            {notification.sender.username
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col">
                        <Link
                          href={`/profile/${notification.senderId}`}
                          className="flex text-[#5B5B5B] font-bold"
                        >
                          {notification.sender.username} <Verified />
                        </Link>
                        <div className="text-[#5B5B5B]">
                          {notification.message}
                        </div>
                      </div>
                    </div>
                    {notification.post && (
                      <a
                        href={`/post/${notification.postId}`}
                        className="flex items-center"
                      >
                        <img
                          src={notification.post.imageUrl}
                          alt="post image"
                          className="w-10 h-10 object-cover"
                        />
                      </a>
                    )}
                  </div>
                )}
                {notification.type === "PIN" && (
                  <div className="flex justify-between">
                    <div className="flex items-center gap-[8px]">
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
                            {notification.sender.username
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col">
                        <Link
                          href={`/profile/${notification.senderId}`}
                          className="flex text-[#5B5B5B] font-bold"
                        >
                          {notification.sender.username} <Verified />
                        </Link>
                        <div className="text-[#5B5B5B]">
                          {notification.message}
                        </div>
                      </div>
                    </div>
                    {notification.post && (
                      <a
                        href={`/post/${notification.postId}`}
                        className="flex items-center"
                      >
                        <img
                          src={notification.post.imageUrl}
                          alt="post image"
                          className="w-10 h-10 object-cover"
                        />
                      </a>
                    )}
                  </div>
                )}
                {notification.type === "COMMENT" && (
                  <div className="flex justify-between">
                    <div className="flex items-center gap-[8px]">
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
                            {notification.sender.username
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col">
                        <Link
                          href={`/profile/${notification.senderId}`}
                          className="flex text-[#5B5B5B] font-bold"
                        >
                          {notification.sender.username} <Verified />
                        </Link>
                        <div className="text-[#5B5B5B]">
                          {notification.message}
                        </div>
                      </div>
                    </div>
                    {notification.post && (
                      <a
                        href={`/post/${notification.postId}`}
                        className="flex items-center"
                      >
                        <img
                          src={notification.post.imageUrl}
                          alt="post image"
                          className="w-10 h-10 object-cover"
                        />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
