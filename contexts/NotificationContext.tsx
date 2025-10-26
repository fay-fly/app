"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useSafeSession } from "@/hooks/useSafeSession";

type NotificationContextType = {
  unreadCount: number;
  refreshCount: () => void;
  decrementCount: () => void;
  setUnreadCount: (count: number) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSafeSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = async () => {
    if (!session) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await axios.get<{ count: number }>(
        "/api/notifications/unread-count"
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const decrementCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    refreshCount();

    const interval = setInterval(refreshCount, 5000);

    return () => clearInterval(interval);
  }, [session]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshCount, decrementCount, setUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCount() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationCount must be used within a NotificationProvider"
    );
  }
  return context;
}