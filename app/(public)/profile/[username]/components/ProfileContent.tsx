"use client";
import { useEffect, useState } from "react";
import { UserWithPosts } from "@/app/types/postWithUser";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  const isOwnProfile = session?.user?.username === username;

  useEffect(() => {
    let isActive = true;

    const fetchUser = async () => {
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

  const handleSubscribe = () => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return prev;
      const newFollowState = !prev.isFollowedByMe;
      return {
        ...prev,
        isFollowedByMe: newFollowState,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (newFollowState ? 1 : -1),
        },
      };
    });
  };

  if (!user) {
    return null;
  }

  const publicationsCount = user.posts.length;
  const pinsCount = user.pins.length;
  const profileBgUrl = user.profileBgUrl;
  const profileBackgroundValue = profileBgUrl
    ? `url(${profileBgUrl}) center/cover`
    : "linear-gradient(135deg, #d8ddff 0%, #a2aaff 50%, #7c89ff 100%)";

  const renderPostTile = (post: UserWithPosts["posts"][number]) => (
    <Link
      key={post.id}
      href={`/post/${post.id}`}
      className="w-full aspect-square overflow-hidden bg-gray-100 relative h-full"
    >
      {post.imageUrls && post.imageUrls.length > 0 && (
        <SafeNextImage
          src={post.imageUrls[0]}
          alt="publication"
          className="w-full h-full object-cover"
          errorSize="small"
          showErrorText={false}
          sizes="(max-width: 768px) 33vw, 25vw"
          width={400}
          height={400}
        />
      )}
      {post.imageUrls && post.imageUrls.length > 1 && (
        <div className="absolute top-2 right-2">
          <MultiplePhotos />
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

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      <div className="h-[124px] relative">
        <div
          className="absolute inset-0"
          style={{ background: profileBackgroundValue }}
        />
        <div className="absolute -bottom-[48px] left-4 flex items-end gap-[24px]">
          {user.pictureUrl ? (
            <img
              src={user.pictureUrl}
              alt="profile picture"
              className="ring-[1.5px] ring-white w-[80px] h-[80px] rounded-full"
            />
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
          <span className="text-[#F883B8] font-semibold text-[14px]">
            Member
          </span>
          <h1 className="text-[#A0A0A0] font-bold text-[16px] flex items-center w-fit">
            <span>@{user.username}</span>
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
        <div className="flex-1 flex justify-center">
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
