"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import clsx from "clsx";
import { useNotificationCount } from "@/contexts/NotificationContext";
import {
  NotificationRenderable,
  NotificationWithRelations,
} from "@/types/notifications";
import { buildNotificationRenderables } from "@/lib/notifications/renderables";
import GroupedNotificationItem from "@/app/(public)/notifications/components/GroupedNotificationItem";

type GroupedNotifications = Record<string, NotificationRenderable[]>;

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

  const renderables = useMemo<NotificationRenderable[]>(() => {
    if (!notifications) {
      return [];
    }
    return buildNotificationRenderables(notifications);
  }, [notifications]);

  const groupedNotifications = useMemo<GroupedNotifications>(() => {
    if (renderables.length === 0) {
      return {};
    }

    return renderables.reduce<GroupedNotifications>((groups, item) => {
      const notificationDate = new Date(item.timestamp);
      const label = notificationDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(item);
      return groups;
    }, {});
  }, [renderables]);

  const renderNotificationGroup = (
    title: string,
    notifications: NotificationRenderable[]
  ) => {
    if (notifications.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#5B5B5B] mb-4 ml-[16px]">
          {title}
        </h2>
        <div className="flex flex-col gap-1 w-full px-[16px]">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={clsx(
                item.unread && "bg-[#7c89ff21]",
                "flex items-center gap-[5px] py-2 w-full"
              )}
            >
              <GroupedNotificationItem item={item} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkeletonLoader = () => {
    const textWidths = [
      ["w-[85%]", "w-[60%]"],
      ["w-[75%]", "w-[45%]"],
      ["w-[90%]", "w-[55%]"],
      ["w-[80%]", "w-[50%]"],
      ["w-[70%]", "w-[40%]"],
    ];

    return (
      <div className="flex flex-col justify-center mr-auto ml-auto max-w-[612px] px-0 mt-3">
        <div className="mb-6">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-4 ml-[16px] animate-pulse" />
          <div className="flex flex-col gap-1 w-full px-[16px]">
            {[...Array(5)].map((_, index) => {
              const hasPreview = index === 1 || index === 3;
              const [mainWidth, timeWidth] = textWidths[index % textWidths.length];

              return (
                <div
                  key={index}
                  className="flex items-start py-2 w-full"
                >
                  <div className="flex gap-[8px] items-start flex-1 min-w-0">
                    <div className="w-[40px] h-[40px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className={clsx("h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse", mainWidth)} />
                      <div className={clsx("h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse", timeWidth)} />
                    </div>
                    {hasPreview && (
                      <div className="w-[40px] h-[40px] bg-gradient-to-br from-gray-200 to-gray-300 rounded animate-pulse flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mb-6">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-28 mb-4 ml-[16px] animate-pulse" />
          <div className="flex flex-col gap-1 w-full px-[16px]">
            {[...Array(3)].map((_, index) => {
              const hasPreview = index === 0;
              const [mainWidth, timeWidth] = textWidths[index % textWidths.length];

              return (
                <div
                  key={index}
                  className="flex items-start py-2 w-full"
                >
                  <div className="flex gap-[8px] items-start flex-1 min-w-0">
                    <div className="w-[40px] h-[40px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className={clsx("h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse", mainWidth)} />
                      <div className={clsx("h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse", timeWidth)} />
                    </div>
                    {hasPreview && (
                      <div className="w-[40px] h-[40px] bg-gradient-to-br from-gray-200 to-gray-300 rounded animate-pulse flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDateGroup = () => {
    if (
      !groupedNotifications ||
      Object.keys(groupedNotifications).length === 0
    ) {
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
        <div className="animate-fade-in">
          {renderSkeletonLoader()}
        </div>
      ) : (
        <div className="flex flex-col justify-center mr-auto ml-auto max-w-[612px] px-0 mt-3 animate-fade-in">
          {renderDateGroup()}
        </div>
      )}
    </>
  );
}
