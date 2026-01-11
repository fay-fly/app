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
        <div className="h-[124px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
        <div className="px-4 mt-[-32px]">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ring-[1.5px] ring-white" />
        </div>
        <div className="mx-[16px] mt-[24px] space-y-3">
          <div className="h-[14px] w-[60px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          <div className="h-[16px] w-[120px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          <div className="h-[24px] w-[180px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          <div className="flex gap-[24px]">
            <div className="h-[16px] w-[100px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
            <div className="h-[16px] w-[100px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex mt-[24px] border-b border-gray-100">
          <div className="flex-1 flex justify-center py-[11px]">
            <div className="h-[16px] w-[100px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          </div>
          <div className="flex-1 flex justify-center py-[11px]">
            <div className="h-[16px] w-[60px] bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
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
      <div className="h-[124px] relative">
        <div
          className="absolute inset-0"
          style={{ background: profileBackgroundValue }}
        />
        <div className="absolute -bottom-[48px] left-4 flex items-end gap-[24px]">
          {user.pictureUrl ? (
            <div className="relative w-[80px] h-[80px]">
              <SafeNextImage
                src={user.pictureUrl}
                alt="profile picture"
                className="ring-[1.5px] ring-white w-[80px] h-[80px] rounded-full object-cover"
                width={80}
                height={80}
                errorSize="small"
                showErrorText={false}
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-[80px] h-[80px] rounded-full bg-(--fly-primary) flex items-center justify-center text-white font-bold text-[22px] ring-[1.5px] ring-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      {isOwnProfile ? (
        <div className="flex justify-end mt-[16px] mr-[16px] p-[8px]">
          <div
            className="bg-[#F7F8FF] rounded-full cursor-pointer"
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
        </div>
      ) : session && (
        <div className="flex justify-end p-[8px]">
          <SubscribeButton
            subscribingId={user.id}
            isSubscribed={user.isFollowedByMe}
            onSuccess={handleSubscribe}
          />
        </div>
      )}
      <div
        className={isOwnProfile || session ? "mx-[16px]" : "mx-[16px] mb-[16px] mt-[60px]"}
      >
        <div className="space-y-1">
          <span
            className={clsx(
              "font-semibold text-[14px]",
              user.role === "admin" && "text-[#EB4C4C]",
              user.role === "creator" && "text-[#7C89FF]",
              user.role === "lead" && "text-[#19B4F6]",
              user.role === "user" && "text-[#F883B8]",
              !user.role && "text-[#F883B8]"
            )}
          >
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
          </span>
          <h1 className="text-[#A0A0A0] font-bold text-[16px] flex items-center gap-[8px] w-fit">
            <span>@{user.username}</span>
            {hasVerifiedBadge(user.role) && <Verified />}
          </h1>
          {user.fullName && (
            <h1 className="text-[24px] text-[#343434] font-bold">
              {user.fullName}
            </h1>
          )}
          <ul className="flex gap-[24px] mt-[10px] text-[#A0A0A0]">
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
          </ul>
          {user.bio && (
            <p className="text-[#5B5B5B] text-[14px] my-[12px]">
              {user.bio}
            </p>
          )}
        </div>
      </div>
      <div className="flex">
        {canShowPosts && (
          <div className="flex-1 flex justify-center">
            <div
              className={clsx(
                "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit text-center",
                tabs === "publications" &&
                  "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]"
              )}
              onClick={() => setTabs("publications")}
            >
              {`${publicationsCount} Publications`}
            </div>
          </div>
        )}
        <div className={clsx(canShowPosts ? "flex-1" : "w-full", "flex justify-center")}>
          <div
            className={clsx(
              "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit min-w-[80px] text-center",
              tabs === "pins" &&
                "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]"
            )}
            onClick={() => setTabs("pins")}
          >
            {`${pinsCount} Pins`}
          </div>
        </div>
      </div>
      {tabs === "publications" && (
        <>
          {publicationsCount === 0 ? (
            <div className="flex justify-center mt-[10px] text-[#A0A0A0]">
              No publications yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
              {user.posts.map((post) => renderPostTile(post))}
            </div>
          )}
        </>
      )}
      {tabs === "pins" && (
        <>
          {pinsCount === 0 ? (
            <div className="flex justify-center mt-[10px] text-[#A0A0A0]">
              No pinned posts yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
              {user.pins.map((pin) => renderPostTile(pin.post))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
