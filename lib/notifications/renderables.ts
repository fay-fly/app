import { NotificationType } from "@prisma/client";
import {
  NotificationAvatar,
  NotificationRenderable,
  NotificationWithRelations,
} from "@/types/notifications";

const GROUPING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

type NotificationGroup = {
  id: string;
  type: NotificationType;
  contextKey: string;
  events: NotificationWithRelations[];
  latestTimestampMs: number;
};

const actionableTypes: NotificationType[] = ["LIKE", "COMMENT", "PIN"];

const buildContextKey = (event: NotificationWithRelations) => {
  if (actionableTypes.includes(event.type)) {
    return `${event.type}-${event.postId ?? event.id}`;
  }

  if (event.type === "FOLLOW") {
    return `${event.type}-${event.receiverId}`;
  }

  return `${event.type}-${event.id}`;
};

const createGroup = (
  event: NotificationWithRelations,
  contextKey: string,
  timestamp: number
): NotificationGroup => ({
  id: `${contextKey}-${event.id}`,
  type: event.type,
  contextKey,
  events: [event],
  latestTimestampMs: timestamp,
});

const selectAvatarUsers = (events: NotificationWithRelations[]) => {
  const avatars: NotificationAvatar[] = [];
  const seen = new Set<number>();

  for (const event of events) {
    if (!event.sender) continue;
    if (seen.has(event.sender.id)) continue;
    avatars.push({
      id: event.sender.id,
      username: event.sender.username,
      pictureUrl: event.sender.pictureUrl,
      role: event.sender.role,
    });
    seen.add(event.sender.id);
    if (avatars.length === 3) break;
  }

  return avatars;
};

const formatActorSummary = (actors: string[]) => {
  if (actors.length === 0) {
    return "Someone";
  }

  if (actors.length === 1) {
    return actors[0];
  }

  if (actors.length === 2) {
    return `${actors[0]} and ${actors[1]}`;
  }

  const remaining = actors.length - 2;
  return `${actors[0]}, ${actors[1]} and ${remaining} others`;
};

const buildPrimaryText = (avatars: NotificationAvatar[]): string => {
  const actorNames = avatars
    .map((avatar) => avatar.username)
    .filter((name): name is string => Boolean(name));

  if (actorNames.length === 0) return "Someone";
  if (actorNames.length === 1) return actorNames[0];
  if (actorNames.length === 2) return `${actorNames[0]}, ${actorNames[1]}`;
  if (actorNames.length === 3) {
    return `${actorNames[0]}, ${actorNames[1]} and ${actorNames[2]}`;
  }
  return `${actorNames[0]}, ${actorNames[1]} and others`;
};

const buildSecondaryText = (group: NotificationGroup) => {
  const latestEvent = group.events[0];
  if (!latestEvent?.message) {
    return undefined;
  }

  const extraCount = group.events.length - 1;
  if (extraCount <= 0) {
    return latestEvent.message;
  }

  return `${latestEvent.message} · +${extraCount} more`;
};

const buildPreview = (group: NotificationGroup) => {
  if (!actionableTypes.includes(group.type)) {
    return undefined;
  }

  const eventWithPost = group.events.find(
    (event) => event.post && event.post.media && event.post.media.length > 0
  );

  if (!eventWithPost?.post?.media?.length || !eventWithPost.postId) {
    return undefined;
  }

  return {
    imageUrl: eventWithPost.post.media[0].url,
    href: `/post/${eventWithPost.postId}`,
  };
};

const buildCTA = (group: NotificationGroup) => {
  const latestEvent = group.events[0];
  if (!latestEvent) return undefined;

  if (group.type === "FOLLOW" && latestEvent.sender) {
    return {
      label: "Subscribe",
      href: latestEvent.sender.username
        ? `/profile/${latestEvent.sender.username}`
        : undefined,
      userId: latestEvent.sender.id,
      username: latestEvent.sender.username,
      isSubscribed: Boolean(latestEvent.senderFollowing),
    };
  }

  return undefined;
};

const resolveGroups = (events: NotificationWithRelations[]) => {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groupsByContext = new Map<string, NotificationGroup[]>();

  sorted.forEach((event) => {
    const contextKey = buildContextKey(event);
    const timestamp = new Date(event.createdAt).getTime();
    const groups = groupsByContext.get(contextKey) ?? [];

    let targetGroup = groups.find(
      (group) => group.latestTimestampMs - timestamp <= GROUPING_WINDOW_MS
    );

    if (!targetGroup) {
      targetGroup = createGroup(event, contextKey, timestamp);
      groups.push(targetGroup);
      groupsByContext.set(contextKey, groups);
    } else {
      targetGroup.events.push(event);
    }
  });

  return Array.from(groupsByContext.values())
    .flat()
    .sort((a, b) => b.latestTimestampMs - a.latestTimestampMs);
};

export const buildNotificationRenderables = (
  events: NotificationWithRelations[]
): NotificationRenderable[] => {
  const groups = resolveGroups(events);

  return groups.map((group) => {
    const avatars = selectAvatarUsers(group.events);
    const uniqueActorIds = Array.from(
      new Set(
        group.events
          .filter((event) => event.senderId)
          .map((event) => event.senderId)
      )
    );

    return {
      id: group.id,
      type: group.type,
      avatarUsers: avatars,
      actorCount: uniqueActorIds.length,
      primaryText: buildPrimaryText(avatars),
      secondaryText: buildSecondaryText(group),
      timestamp: new Date(group.latestTimestampMs).toISOString(),
      preview: buildPreview(group),
      unread: group.events.some((event) => !event.read),
      cta: buildCTA(group),
      eventCount: group.events.length,
    };
  });
};
