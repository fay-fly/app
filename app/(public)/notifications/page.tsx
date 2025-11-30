"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Notification, User, Post } from "@prisma/client";
import NotificationItem from "@/app/(public)/post/[id]/components/NotificationItem";
import clsx from "clsx";
import { useNotificationCount } from "@/contexts/NotificationContext";

export type NotificationWithRelations = Notification & {
  sender: User;
  receiver: User;
  post: Post | null;
  read: boolean;
};

type GroupedNotifications = Record<string, NotificationWithRelations[]>;

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<NotificationWithRelations[]>();
  const { setUnreadCount } = useNotificationCount();

  useEffect(() => {
    axios
      .get<NotificationWithRelations[]>(`/api/notifications/get`)
      .then((response) => {
        setNotifications(response.data);
      });
    axios.post("/api/notifications/mark-read").then(() => {
      setUnreadCount(0);
    });
  }, [setUnreadCount]);

  const groupedNotifications = useMemo<GroupedNotifications>(() => {
    if (!notifications) {
      return {};
    }

    return notifications.reduce<GroupedNotifications>((groups, notification) => {
      const notificationDate = new Date(notification.createdAt);
      const label = notificationDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(notification);
      return groups;
    }, {});
  }, [notifications]);

  const renderNotificationGroup = (
    title: string,
    notifications: NotificationWithRelations[]
  ) => {
    if (notifications.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#5B5B5B] mb-2 px-[5px]">
          {title}
        </h2>
        <div className="flex flex-col gap-1">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                !notification.read && "bg-[#7c89ff21]",
                "flex items-center gap-[5px] py-2 pl-[5px] pr-[18px]"
              )}
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
      </div>
    );
  };

  const renderSkeletonLoader = () => {
    return (
      <div className="flex flex-col justify-center mr-auto ml-auto max-w-[612px] px-[16px] md:px-[16px] mt-5">
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-24 mb-2 px-[5px] animate-pulse" />
          <div className="flex flex-col gap-1">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-[5px] py-2 pl-[5px] pr-[18px]"
              >
                <div className="w-[8px] h-[8px] rounded-full bg-gray-200 animate-pulse" />
                <div className="flex gap-[8px] items-center flex-1">
                  <div className="w-[32px] h-[32px] bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-24 mb-2 px-[5px] animate-pulse" />
          <div className="flex flex-col gap-1">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-[5px] py-2 pl-[5px] pr-[18px]"
              >
                <div className="w-[8px] h-[8px] rounded-full bg-gray-200 animate-pulse" />
                <div className="flex gap-[8px] items-center flex-1">
                  <div className="w-[32px] h-[32px] bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDateGroup = () => {
    if (!groupedNotifications || Object.keys(groupedNotifications).length === 0) {
      return (
        <div className="text-center text-[#A0A0A0] mt-10">
          No notifications yet
        </div>
      );
    }

    return Object.entries(groupedNotifications).map(
      ([label, notifications]) => (
        <div key={label}>{renderNotificationGroup(label, notifications)}</div>
      )
    );
  };

  return (
    <>
      {!notifications ? (
        renderSkeletonLoader()
      ) : (
        <div className="flex flex-col justify-center mr-auto ml-auto max-w-[612px] px-[16px] md:px-[16px] mt-5">
          {renderDateGroup()}
        </div>
      )}
    </>
  );
}
