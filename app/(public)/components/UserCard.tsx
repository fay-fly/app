import React from "react";
import clsx from "clsx";

type User = {
  username: string | null;
  image: string | null;
  description?: string | null;
};

type UserCardProps = {
  user: User;
  size?: number;
  onClick?: () => void;
  showStatus?: boolean;
  alwaysShowUsername?: boolean;
  showDescription?: boolean;
};

export function UserCard({
  user,
  size = 32,
  onClick,
  showStatus = true,
  alwaysShowUsername = true,
  showDescription = false,
}: UserCardProps) {
  const initials = user.username?.charAt(0).toUpperCase() ?? "";

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

  return (
    <div className="flex gap-[8px] items-center cursor-pointer">
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
      <div
        className={clsx(
          "flex min-w-0 flex-col",
          !alwaysShowUsername && "hidden md:flex"
        )}
      >
        <span className={clsx("text-(--fly-text-primary) font-bold", showDescription && "truncate")}>
          {user.username}
        </span>
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
