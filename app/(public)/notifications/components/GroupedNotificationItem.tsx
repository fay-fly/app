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
  const overlap = 16; // px (adjusted for tighter overlap as shown in Figma)
  const width = baseWidth + (count - 1) * overlap;
  const displayAvatars = avatars.slice(0, maxDisplay);
  const hasOverflow = avatars.length > maxDisplay;

  return (
    <div
      className="relative flex h-[40px] flex-shrink-0 items-center"
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
            style={{ left: offset, zIndex: displayAvatars.length - index }}
          >
            {isLastSlot ? (
              <div
                className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-(--fly-primary) text-sm font-semibold text-white border-[1.5px] border-white"
              >
                +{overflowCount}
              </div>
            ) : hasImage ? (
              <Link
                href={avatar.username ? `/profile/${avatar.username}` : "#"}
                className="block h-[40px] w-[40px] rounded-full overflow-hidden border-[1.5px] border-white"
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
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-(--fly-primary) text-sm font-semibold text-white border-[1.5px] border-white"
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
      <span className="inline-flex items-center gap-0 text-[14px] font-semibold text-[#343434] leading-[22px] tracking-[-0.14px]">
        <span>{displayName}</span>
        {user.role && hasVerifiedBadge(user.role) && <Verified className="w-[16px] h-[16px]" />}
      </span>
    );

    return (
      <span key={`${user.id}-${index}`} className="inline-flex items-center">
        {user.username ? (
          <Link
            href={`/profile/${user.username}`}
            className="inline-flex items-center gap-0 text-[14px] font-semibold text-[#343434] leading-[22px] tracking-[-0.14px] cursor-pointer"
          >
            <span>{displayName}</span>
            {user.role && hasVerifiedBadge(user.role) && <Verified className="w-[16px] h-[16px]" />}
          </Link>
        ) : (
          content
        )}
        {separator && (
          <span className="text-[14px] font-semibold text-[#343434] leading-[22px] tracking-[-0.14px]">
            {separator}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="flex w-full items-center justify-between gap-[8px]">
      <div className="flex flex-1 items-center gap-[8px] min-w-0">
        <AvatarStack avatars={item.avatarUsers} />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[14px] font-semibold text-[#343434] leading-[22px] tracking-[-0.14px] flex flex-wrap items-center">
            {nameUsers.map(renderName)}
            {hasOverflow && (
              <span className="text-[14px] font-semibold text-[#343434] leading-[22px] tracking-[-0.14px]">
                {" "}
                and others
              </span>
            )}
          </span>
          <span className="text-[14px] font-normal text-[#5b5b5b] leading-[20px] tracking-[-0.14px] whitespace-pre-wrap">
            {item.secondaryText}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-[8px] flex-shrink-0">
        {item.preview && (
          <Link href={item.preview.href} className="relative h-[40px] w-[40px] flex-shrink-0">
            <SafeNextImage
              src={item.preview.imageUrl}
              alt="Preview"
              className="h-[40px] w-[40px] object-cover"
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
