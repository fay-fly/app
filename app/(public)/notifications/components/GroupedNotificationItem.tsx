"use client";

import Link from "next/link";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { NotificationRenderable } from "@/types/notifications";
import SubscribeButton from "@/app/(public)/discover/components/SubscribeButton";
import Verified from "@/icons/Verified";
import { hasVerifiedBadge } from "@/lib/permissions";
import SafeNextImage from "@/components/SafeNextImage";

type Props = {
  item: NotificationRenderable;
};

const AvatarStack = ({
  avatars,
}: {
  avatars: NotificationRenderable["avatarUsers"];
}) => {
  if (avatars.length === 0) return null;
  const maxDisplay = 3;
  const count = Math.min(avatars.length, maxDisplay);
  const baseWidth = 40; // px
  const overlap = 20; // px
  const width = baseWidth + (count - 1) * overlap;
  const displayAvatars = avatars.slice(0, maxDisplay);
  const hasOverflow = avatars.length > maxDisplay;

  return (
    <div
      className="relative flex h-8 flex-shrink-0"
      style={{ width: `${width}px` }}
    >
      {displayAvatars.map((avatar, index) => {
        const offset = index * overlap;
        const isLastSlot = hasOverflow && index === maxDisplay - 1;
        const hasImage = Boolean(avatar.pictureUrl);
        const initials = avatar.username?.charAt(0).toUpperCase() ?? "?";
        const overflowCount = avatars.length - (maxDisplay - 1);

        return (
          <div
            key={avatar.id}
            className="absolute top-0"
            style={{ left: offset }}
          >
            {isLastSlot ? (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-(--fly-primary) text-sm font-semibold text-white"
                style={{ boxShadow: "0 0 0 1.5px #fff" }}
              >
                +{overflowCount}
              </div>
            ) : hasImage ? (
              <Link
                href={avatar.username ? `/profile/${avatar.username}` : "#"}
                className="block h-10 w-10 rounded-full overflow-hidden"
                style={{ boxShadow: "0 0 0 1.5px #fff" }}
              >
                <SafeNextImage
                  src={avatar.pictureUrl ?? ""}
                  alt={avatar.username ?? "User avatar"}
                  className="h-full w-full rounded-full object-cover"
                  errorSize="small"
                  showErrorText={false}
                  sizes="40px"
                  width={40}
                  height={40}
                />
              </Link>
            ) : (
              <Link
                href={avatar.username ? `/profile/${avatar.username}` : "#"}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-(--fly-primary) text-sm font-semibold text-white"
                  style={{ boxShadow: "0 0 0 1.5px #fff" }}
                >
                  {initials}
                </div>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function GroupedNotificationItem({ item }: Props) {
  const hasOverflow = item.actorCount > item.avatarUsers.length;
  const nameUsers = hasOverflow
    ? item.avatarUsers.slice(0, Math.max(1, item.avatarUsers.length - 1))
    : item.avatarUsers;

  const renderName = (
    user: NotificationRenderable["avatarUsers"][number],
    index: number
  ) => {
    const displayName = user.username ?? "Someone";
    const isLast = index === nameUsers.length - 1;
    const separator =
      nameUsers.length === 1
        ? ""
        : index < nameUsers.length - 2
        ? ", "
        : isLast
        ? ""
        : " and ";

    const content = (
      <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#343434]">
        <span>{displayName}</span>
        {user.role && hasVerifiedBadge(user.role) && <Verified />}
      </span>
    );

    return (
      <span key={`${user.id}-${index}`} className="inline-flex items-center">
        {user.username ? (
          <Link
            href={`/profile/${user.username}`}
            className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#343434] cursor-pointer"
          >
            <span>{displayName}</span>
            {user.role && hasVerifiedBadge(user.role) && <Verified />}
          </Link>
        ) : (
          content
        )}
        {separator && (
          <span className="text-[14px] font-semibold text-[#343434]">
            {separator}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="flex w-full items-start justify-between gap-3">
      <div className="flex flex-1 items-start gap-[8px]">
        <AvatarStack avatars={item.avatarUsers} />
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#343434]">
            {nameUsers.map(renderName)}
            {hasOverflow && (
              <span className="text-[14px] font-semibold text-[#343434]">
                {" "}
                and others
              </span>
            )}
          </span>
          <span className="text-[14px] text-[#5B5B5B]">
            {item.secondaryText} · {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {item.preview && (
          <Link href={item.preview.href} className="relative h-10 w-10 flex-shrink-0">
            <SafeNextImage
              src={item.preview.imageUrl}
              alt="Preview"
              className="h-10 w-10 object-cover"
              errorSize="small"
              showErrorText={false}
              sizes="40px"
              width={40}
              height={40}
            />
          </Link>
        )}
        {item.cta?.label === "Subscribe" && item.cta.userId && (
          <SubscribeButton
            subscribingId={item.cta.userId}
            isSubscribed={item.cta.isSubscribed ?? false}
            onSuccess={(_isSubscribed) => {}}
          />
        )}
      </div>
    </div>
  );
}
