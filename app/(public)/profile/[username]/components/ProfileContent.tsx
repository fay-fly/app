"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { UserWithPosts } from "@/app/types/postWithUser";
import axios from "axios";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";
import ViewSubs from "@/app/(public)/profile/[username]/components/ViewSubs";
import Edit from "@/icons/Edit";
import ProfileEditModal from "@/app/(public)/profile/[username]/components/ProfileEditModal";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { handleError } from "@/utils/errors";

type SkeletonWrapperProps = {
  show: boolean;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  overlayClassName?: string;
};

function SkeletonWrapper({
  show,
  children,
  className,
  containerClassName,
  overlayClassName,
}: SkeletonWrapperProps) {
  return (
    <div className={clsx("relative", containerClassName)}>
      <div className={clsx(className, show && "opacity-0")}>{children}</div>
      {show && (
        <div
          aria-hidden
          className={clsx(
            "absolute inset-0 animate-pulse bg-gray-200 pointer-events-none",
            overlayClassName ?? "rounded"
          )}
        />
      )}
    </div>
  );
}

export type EditProfilePayload = {
  fullName: string;
  username: string;
  gender: "male" | "female";
  bio: string;
  pictureUrl: string;
  profileBgUrl: string;
};

export default function ProfileContent({ username }: { username: string }) {
  const [tabs, setTabs] = useState<"publications" | "pins">("publications");
  const [user, setUser] = useState<UserWithPosts>();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  const isOwnProfile = session?.user?.username === username;

  useEffect(() => {
    let isActive = true;

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<UserWithPosts>(
          `/api/users/get?username=${username}`
        );
        if (isActive) {
          setUser(response.data);
        }
      } catch (error) {
        handleError(error);
        if (isActive) {
          setUser(undefined);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
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

  const publicationsCount = user?.posts.length ?? 0;
  const pinsCount = user?.pins.length ?? 0;
  const showSkeleton = isLoading || !user;
  const profileBgUrl = user?.profileBgUrl;
  const profileBackgroundValue = profileBgUrl
    ? `url(${profileBgUrl}) center/cover`
    : "linear-gradient(135deg, #d8ddff 0%, #a2aaff 50%, #7c89ff 100%)";
  const skeletonPlaceholders = useMemo(
    () => Array.from({ length: 6 }, (_, index) => index),
    []
  );

  const renderPostTile = (post: UserWithPosts["posts"][number]) => (
    <Link
      key={post.id}
      href={`/post/${post.id}`}
      className="w-full aspect-square overflow-hidden bg-gray-100 relative h-full"
    >
      <Image
        src={post.imageUrl}
        alt="publication"
        className="w-full h-full object-cover"
        width={1}
        height={1}
        unoptimized
      />
      <div
        className={clsx(
          "absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 opacity-0",
          "hover:opacity-70 transition-opacity duration-100 cursor-pointer"
        )}
      ></div>
    </Link>
  );

  return (
    <div className="w-full max-w-[1000px] mx-auto pb-[48px] md:pb-0">
      <div className="h-[124px] relative">
        <div
          className={clsx(
            "absolute inset-0",
            showSkeleton && "animate-pulse bg-gray-200"
          )}
          style={!showSkeleton ? { background: profileBackgroundValue } : undefined}
        />
        <div className="absolute -bottom-[48px] left-4 flex items-end gap-[24px]">
          {user?.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt="profile picture"
              className="ring-[1.5px] ring-white w-[80px] h-[80px] rounded-full"
            />
          ) : (
            <SkeletonWrapper
              show={showSkeleton}
              containerClassName="inline-flex w-[80px] h-[80px]"
              overlayClassName="rounded-full"
            >
              <div className="w-[80px] h-[80px] rounded-full bg-(--fly-primary) flex items-center justify-center text-white font-bold text-[22px] ring-[1.5px] ring-white">
                {showSkeleton
                  ? "\u00A0"
                  : user?.username?.charAt(0).toUpperCase() ?? ""}
              </div>
            </SkeletonWrapper>
          )}
        </div>
      </div>
      {isOwnProfile && !showSkeleton && user && (
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
      )}
      <div
        className={isOwnProfile ? "mx-[16px]" : "mx-[16px] mb-[16px] mt-[60px]"}
      >
        <div className="space-y-1">
            <SkeletonWrapper
              show={showSkeleton}
              className="inline-block"
              containerClassName="inline-block"
              overlayClassName="rounded-full"
            >
              <span className="text-[#F883B8] font-semibold text-[14px]">
                Member
              </span>
            </SkeletonWrapper>
          <SkeletonWrapper
            show={showSkeleton}
            className="w-fit"
            containerClassName="w-fit"
            overlayClassName="rounded-full"
          >
            <h1 className="text-[#A0A0A0] font-bold text-[16px] flex items-center w-fit">
              <span>@{user?.username ?? username}</span>
            </h1>
          </SkeletonWrapper>
          {(showSkeleton || user?.fullName) && (
            <SkeletonWrapper
              show={showSkeleton}
              className="block min-h-[32px] w-fit"
              containerClassName="w-fit min-h-[32px]"
              overlayClassName="rounded-full"
            >
              <h1 className="text-[24px] text-[#343434] font-bold">
                {user?.fullName ?? "\u00A0"}
              </h1>
            </SkeletonWrapper>
          )}
          <ul
            className={clsx(
              "flex gap-[24px] mt-[10px] text-[#A0A0A0]",
              showSkeleton && "pointer-events-none"
            )}
          >
            {showSkeleton ? (
              <>
                <li className="h-4 w-[120px] bg-gray-200 rounded animate-pulse"></li>
                <li className="h-4 w-[140px] bg-gray-200 rounded animate-pulse"></li>
              </>
            ) : (
              <>
                <ViewSubs
                  count={user?._count.followers ?? 0}
                  kind="subscribers"
                  fetchUrl="/api/users/subscribers"
                  userId={user?.id ?? 0}
                />
                <ViewSubs
                  count={user?._count.subscriptions ?? 0}
                  kind="subscriptions"
                  fetchUrl="/api/users/subscriptions"
                  userId={user?.id ?? 0}
                />
              </>
            )}
          </ul>
          {(showSkeleton || user?.bio) && (
            <SkeletonWrapper
              show={showSkeleton}
              className="block min-h-[20px] w-full max-w-[360px]"
              containerClassName="w-full max-w-[360px] min-h-[20px]"
              overlayClassName="rounded"
            >
              <p className="text-[#5B5B5B] text-[14px] my-[12px]">
                {user?.bio ?? "\u00A0"}
              </p>
            </SkeletonWrapper>
          )}
        </div>
      </div>
      <div className="flex">
        <div className="flex-1 flex justify-center">
          <SkeletonWrapper
            show={showSkeleton}
            className="max-w-fit"
            containerClassName="max-w-fit"
            overlayClassName="rounded-full"
          >
            <div
              className={clsx(
                "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit",
                tabs === "publications" &&
                  "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]",
                showSkeleton && "pointer-events-none"
              )}
              onClick={() => setTabs("publications")}
            >
              {`${publicationsCount} Publications`}
            </div>
          </SkeletonWrapper>
        </div>
        <div className="flex-1 flex justify-center">
          <SkeletonWrapper
            show={showSkeleton}
            className="max-w-fit"
            containerClassName="max-w-fit"
            overlayClassName="rounded-full"
          >
            <div
              className={clsx(
                "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit min-w-[80px]",
                tabs === "pins" &&
                  "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]",
                showSkeleton && "pointer-events-none"
              )}
              onClick={() => setTabs("pins")}
            >
              {`${pinsCount} Pins`}
            </div>
          </SkeletonWrapper>
        </div>
      </div>
      {tabs === "publications" && (
        <>
          {!showSkeleton && publicationsCount === 0 ? (
            <div className="flex justify-center mt-[10px] text-[#A0A0A0]">
              No publications yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
              {showSkeleton
                ? skeletonPlaceholders.map((placeholder) => (
                    <div
                      key={`skeleton-publication-${placeholder}`}
                      className="w-full aspect-square bg-gray-200 animate-pulse"
                    ></div>
                  ))
                : (user?.posts ?? []).map((post) => renderPostTile(post))}
            </div>
          )}
        </>
      )}
      {tabs === "pins" && (
        <>
          {!showSkeleton && pinsCount === 0 ? (
            <div className="flex justify-center mt-[10px] text-[#A0A0A0]">
              No pinned posts yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
              {showSkeleton
                ? skeletonPlaceholders.map((placeholder) => (
                    <div
                      key={`skeleton-pin-${placeholder}`}
                      className="w-full aspect-square bg-gray-200 animate-pulse"
                    ></div>
                  ))
                : (user?.pins ?? []).map((pin) => renderPostTile(pin.post))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
