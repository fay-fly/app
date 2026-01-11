"use client";
import { useEffect, useState } from "react";
import { UserWithPosts } from "@/types/postWithUser";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import ViewSubs from "@/app/(public)/profile/[username]/components/ViewSubs";
import Edit from "@/icons/Edit";
import ProfileEditModal from "@/app/(public)/profile/[username]/components/ProfileEditModal";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { handleError } from "@/utils/errors";
import SubscribeButton from "@/app/(public)/discover/components/SubscribeButton";
import MultiplePhotos from "@/icons/MultiplePhotos";
import SafeNextImage from "@/components/SafeNextImage";
import Verified from "@/icons/Verified";
import { hasVerifiedBadge, canCreatePosts } from "@/lib/permissions";

export type EditProfilePayload = {
  fullName: string;
  username: string;
  gender: "male" | "female";
  bio: string;
  pictureUrl: string;
  profileBgUrl: string;
};

export default function ProfileContent({ username }: { username: string }) {
  const [user, setUser] = useState<UserWithPosts>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  const isOwnProfile = session?.user?.username === username;

  const canShowPosts = user ? canCreatePosts(user.role) : true;

  const [tabs, setTabs] = useState<"publications" | "pins">(canShowPosts ? "publications" : "pins");

  useEffect(() => {
    let isActive = true;

    const fetchUser = async () => {
      try {
        const response = await axios.get<UserWithPosts>(
          `/api/users/get?username=${username}`
        );
        if (!isActive) {
          return;
        }

        if (isActive) {
          setUser(response.data);
          if (!canCreatePosts(response.data.role)) {
            setTabs("pins");
          }
        }
      } catch (error) {
        handleError(error);
        if (isActive) {
          setUser(undefined);
        }
      }
    };

    fetchUser();

    return () => {
      isActive = false;
    };
  }, [username]);

  const handleSaveProfile = async (data: EditProfilePayload) => {
    try {
      await axios.post("/api/users/update", {
        ...data,
      });
      const response = await axios.get<UserWithPosts>(
        `/api/users/get?username=${data.username}`
      );
      setUser(response.data);
      setIsModalOpen(false);

      await update({
        username: response.data.username,
        image: response.data.pictureUrl,
      });

      if (data.username !== username) {
        router.push(`/profile/${data.username}`);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubscribe = (nextState: boolean) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return prev;
      if (prev.isFollowedByMe === nextState) {
        return prev;
      }
      const followerDelta = nextState ? 1 : -1;
      return {
        ...prev,
        isFollowedByMe: nextState,
        _count: {
          ...prev._count,
          followers: prev._count.followers + followerDelta,
        },
      };
    });
  };

  if (!user) {
    return (
      <div className="w-full max-w-[1000px] mx-auto animate-fade-in">
        {/* Cover skeleton */}
        <div className="h-[124px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />

        {/* Avatar and action buttons skeleton */}
        <div className="flex items-start justify-between px-[16px] mt-[-32px]">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ring-[2px] ring-white flex-shrink-0" />
          <div className="flex items-center gap-[8px] mt-[40px]">
            <div className="w-[80px] h-[32px] rounded-[8px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          </div>
        </div>

        {/* User info skeleton */}
        <div className="px-[16px] mt-[16px] space-y-2">
          <div className="h-[14px] w-[60px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          <div className="h-[16px] w-[120px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          <div className="h-[24px] w-[180px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          <div className="flex gap-[16px] pt-[4px]">
            <div className="h-[16px] w-[100px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
            <div className="h-[16px] w-[100px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex mt-[24px]">
          <div className="flex-1 flex justify-center py-[12px]">
            <div className="h-[16px] w-[100px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          </div>
          <div className="flex-1 flex justify-center py-[12px]">
            <div className="h-[16px] w-[60px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-3 gap-[2px] mt-[16px]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const publicationsCount = user.posts.length;
  const pinsCount = user.pins.length;
  const profileBgUrl = user.profileBgUrl;
  const profileBackgroundValue = profileBgUrl
    ? `url(${profileBgUrl}) center/cover`
    : "linear-gradient(135deg, #d8ddff 0%, #a2aaff 50%, #7c89ff 100%)";

  const renderPostTile = (post: UserWithPosts["posts"][number]) => {
    const primaryMedia = post.media?.[0];
    const hasMultiple = (post.media?.length ?? 0) > 1;

    return (
      <Link
        key={post.id}
        href={`/post/${post.id}`}
        className="w-full aspect-square overflow-hidden bg-gray-100 relative h-full"
      >
        {primaryMedia ? (
          <SafeNextImage
            src={primaryMedia.url}
            alt="publication"
            className="w-full h-full object-cover"
            errorSize="small"
            showErrorText={false}
            sizes="(max-width: 768px) 33vw, 25vw"
            width={primaryMedia.width || 400}
            height={primaryMedia.height || 400}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {hasMultiple && (
          <div className="absolute top-[8px] right-[8px]">
            <MultiplePhotos className="w-[24px] h-[24px] text-white" />
          </div>
        )}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 opacity-0",
            "hover:opacity-70 transition-opacity duration-100 cursor-pointer"
          )}
        ></div>
      </Link>
    );
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto animate-fade-in">
      {/* Cover Banner */}
      <div className="h-[124px] relative">
        <div
          className="absolute inset-0"
          style={{ background: profileBackgroundValue }}
        />
      </div>

      {/* Avatar and Action Buttons Row */}
      <div className="flex items-start justify-between px-[16px] mt-[-32px]">
        {/* Avatar */}
        {user.pictureUrl ? (
          <div className="relative w-[80px] h-[80px] flex-shrink-0">
            <SafeNextImage
              src={user.pictureUrl}
              alt="profile picture"
              className="ring-[2px] ring-white w-[80px] h-[80px] rounded-full object-cover"
              width={80}
              height={80}
              errorSize="small"
              showErrorText={false}
              sizes="80px"
            />
          </div>
        ) : (
          <div className="w-[80px] h-[80px] rounded-full bg-(--fly-primary) flex items-center justify-center text-white font-bold text-[22px] ring-[2px] ring-white flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-[8px] mt-[40px]">
          {isOwnProfile ? (
            <>
              <div
                className="w-[40px] h-[40px] bg-[#F7F8FF] rounded-full cursor-pointer flex items-center justify-center"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit />
              </div>
              <ProfileEditModal
                isOpen={isModalOpen}
                onCloseAction={() => setIsModalOpen(false)}
                onSaveAction={handleSaveProfile}
                username={user.username}
                pictureUrl={user.pictureUrl}
                bio={user.bio}
                fullName={user.fullName}
                profileBgUrl={user.profileBgUrl}
              />
            </>
          ) : session && (
            <SubscribeButton
              subscribingId={user.id}
              isSubscribed={user.isFollowedByMe}
              onSuccess={handleSubscribe}
            />
          )}
        </div>
      </div>
      {/* User Info Section */}
      <div className="px-[16px] mt-[16px]">
        {/* Role Label */}
        <span
          className={clsx(
            "font-semibold text-[14px] leading-[20px] tracking-[-0.14px]",
            user.role === "admin" && "text-[#EB4C4C]",
            user.role === "creator" && "text-[#7C89FF]",
            user.role === "lead" && "text-[#19B4F6]",
            user.role === "user" && "text-[#F883B8]",
            !user.role && "text-[#F883B8]"
          )}
        >
          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Author"}
        </span>

        {/* Username */}
        <p className="text-[#A0A0A0] font-medium text-[16px] leading-[22px] tracking-[-0.16px] mt-[4px]">
          @{user.username}
        </p>

        {/* Full Name with Verified Badge */}
        {user.fullName && (
          <h1 className="text-[24px] text-[#343434] font-bold leading-[32px] tracking-[-0.24px] mt-[4px] flex items-center gap-[4px]">
            {user.fullName}
            {hasVerifiedBadge(user.role) && <Verified className="w-[20px] h-[20px]" />}
          </h1>
        )}

        {/* Stats */}
        <div className="flex gap-[16px] mt-[12px]">
          <ViewSubs
            count={user._count.followers}
            kind="subscribers"
            fetchUrl="/api/users/subscribers"
            userId={user.id}
          />
          <ViewSubs
            count={user._count.subscriptions}
            kind="subscriptions"
            fetchUrl="/api/users/subscriptions"
            userId={user.id}
          />
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-[#5B5B5B] text-[14px] leading-[20px] tracking-[-0.14px] mt-[12px]">
            {user.bio}
          </p>
        )}
      </div>
      {/* Tabs */}
      <div className="flex mt-[24px]">
        {canShowPosts && (
          <div className="flex-1 flex justify-center">
            <button
              type="button"
              className={clsx(
                "text-[14px] leading-[20px] tracking-[-0.14px] cursor-pointer py-[12px] px-[16px] relative",
                tabs === "publications"
                  ? "font-semibold text-[#5B5B5B]"
                  : "font-normal text-[#A0A0A0]"
              )}
              onClick={() => setTabs("publications")}
            >
              {`${publicationsCount} Publications`}
              {tabs === "publications" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F458A3]" />
              )}
            </button>
          </div>
        )}
        <div className={clsx(canShowPosts ? "flex-1" : "w-full", "flex justify-center")}>
          <button
            type="button"
            className={clsx(
              "text-[14px] leading-[20px] tracking-[-0.14px] cursor-pointer py-[12px] px-[16px] relative",
              tabs === "pins"
                ? "font-semibold text-[#5B5B5B]"
                : "font-normal text-[#A0A0A0]"
            )}
            onClick={() => setTabs("pins")}
          >
            {`${pinsCount} Pins`}
            {tabs === "pins" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F458A3]" />
            )}
          </button>
        </div>
      </div>
      {/* Content Grid */}
      {tabs === "publications" && (
        <>
          {publicationsCount === 0 ? (
            <div className="flex justify-center py-[40px] text-[#A0A0A0] text-[14px]">
              No publications yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[16px]">
              {user.posts.map((post) => renderPostTile(post))}
            </div>
          )}
        </>
      )}
      {tabs === "pins" && (
        <>
          {pinsCount === 0 ? (
            <div className="flex justify-center py-[40px] text-[#A0A0A0] text-[14px]">
              No pinned posts yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[16px]">
              {user.pins.map((pin) => renderPostTile(pin.post))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
