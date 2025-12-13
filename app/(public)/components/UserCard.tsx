import React from "react";
import clsx from "clsx";
import Link from "next/link";
import Verified from "@/icons/Verified";
import { hasVerifiedBadge } from "@/lib/permissions";

type User = {
  username: string | null;
  image: string | null;
  description?: string | null;
  role?: string;
};

type UserCardProps = {
  user: User;
  size?: number;
  onClick?: () => void;
  showStatus?: boolean;
  alwaysShowUsername?: boolean;
  showDescription?: boolean;
  clickable?: boolean;
  disableHoverUnderline?: boolean;
};

export function UserCard({
  user,
  size = 32,
  onClick,
  showStatus = true,
  alwaysShowUsername = true,
  showDescription = false,
  clickable = false,
  disableHoverUnderline = false,
}: UserCardProps) {
  const initials = user.username?.charAt(0).toUpperCase() ?? "";
  const profileUrl = `/profile/${user.username}`;

  const AvatarImg = (
    <img
      src={user.image ?? ""}
      alt="profile image"
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );

  const AvatarFallback = (
    <div
      className={clsx(
        "flex items-center justify-center text-white font-semibold",
        "bg-(--fly-primary) rounded-full"
      )}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );

  const avatarContent = (
    <div
      className="relative"
      style={{ width: size, height: size, display: "inline-block" }}
      onClick={onClick}
    >
      {user.image ? AvatarImg : AvatarFallback}
      {showStatus && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 block",
            "w-[8px] h-[8px]",
            "bg-(--fly-success) border-1 border-white rounded-full"
          )}
        />
      )}
    </div>
  );

  const usernameContent = (
    <div className="flex items-center gap-[4px]">
      <span className={clsx("text-(--fly-text-primary) font-bold", showDescription && "truncate")}>
        {user.username}
      </span>
      {user.role && hasVerifiedBadge(user.role) && <Verified />}
    </div>
  );

  return (
    <div className="flex gap-[8px] items-center cursor-pointer">
      {clickable ? (
        <Link href={profileUrl}>
          {avatarContent}
        </Link>
      ) : (
        avatarContent
      )}
      <div
        className={clsx(
          "flex min-w-0 flex-col",
          !alwaysShowUsername && "hidden md:flex"
        )}
      >
        {clickable ? (
          <Link
            href={profileUrl}
            className={clsx(!disableHoverUnderline && "hover:underline")}
          >
            {usernameContent}
          </Link>
        ) : (
          usernameContent
        )}
        {showDescription && user.description && (
          <span className="text-sm text-[#909090] truncate">
            {user.description}
          </span>
        )}
      </div>
    </div>
  );
}

export default UserCard;
