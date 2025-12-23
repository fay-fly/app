import { Notification, Post, User, NotificationType } from "@prisma/client";

export type NotificationUser = Pick<
  User,
  "id" | "username" | "pictureUrl" | "role"
>;

export type NotificationWithRelations = Notification & {
  sender: NotificationUser;
  senderFollowing?: boolean;
  post: {
    id: number;
    media: {
      url: string;
      thumbnailUrl?: string;
      smallUrl?: string;
      mediumUrl?: string;
      originalUrl?: string;
      width: number;
      height: number;
    }[];
  } | null;
};

export type NotificationAvatar = {
  id: number;
  username: string | null;
  pictureUrl: string | null;
  role?: string | null;
};

export type NotificationCTA = {
  label: string;
  href?: string;
  userId?: number;
  username?: string | null;
  isSubscribed?: boolean;
};

export type NotificationPreview = {
  imageUrl: string;
  href: string;
};

export type NotificationRenderable = {
  id: string;
  type: NotificationType;
  avatarUsers: NotificationAvatar[];
  actorCount: number;
  primaryText: string;
  secondaryText?: string;
  timestamp: string;
  preview?: NotificationPreview;
  unread: boolean;
  cta?: NotificationCTA;
  eventCount: number;
};
