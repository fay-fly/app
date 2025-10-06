"use client";
import { useEffect, useState } from "react";
import { UserWithPosts } from "@/app/types/postWithUser";
import axios from "axios";
import Image from "next/image";
import PageLoader from "@/components/PageLoader";
import clsx from "clsx";
import Link from "next/link";
import ViewSubs from "@/app/(public)/profile/[username]/components/ViewSubs";
import Edit from "@/icons/Edit";
import ProfileEditModal from "@/app/(public)/profile/[username]/components/ProfileEditModal";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {handleError} from "@/utils/errors";

export type EditProfilePayload = {
  fullName: string;
  username: string;
  gender: "male" | "female";
  bio: string;
  pictureUrl: string;
  profileBgUrl: string;
}

export default function ProfileContent({ username }: { username: string }) {
  const [tabs, setTabs] = useState<"publications" | "pins">("publications");
  const [user, setUser] = useState<UserWithPosts>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  // Check if the current user is viewing their own profile
  const isOwnProfile = session?.user?.username === username;

  useEffect(() => {
    axios
      .get<UserWithPosts>(`/api/users/get?username=${username}`)
      .then((response) => {
        setUser(response.data);
      });
  }, [username]);

  const handleSaveProfile = async (data: EditProfilePayload) => {
    try {
      await axios.post("/api/users/update", {
        ...data
      });
      const response = await axios.get<UserWithPosts>(`/api/users/get?username=${data.username}`);
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
      handleError(error)
    }
  };

  return !user ? (
    <PageLoader />
  ) : (
    <div className="w-full max-w-[1000px] mx-auto pb-[48px] md:pb-0">
      <div
        className="h-[124px] relative"
        style={{
          background: user.profileBgUrl
            ? `url(${user.profileBgUrl}) center/cover`
            : "linear-gradient(135deg, #d8ddff 0%, #a2aaff 50%, #7c89ff 100%)",
        }}
      >
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
      {isOwnProfile && (
        <div className="flex justify-end mt-[16px] mr-[16px] p-[8px]">
          <div className="bg-[#F7F8FF] rounded-full cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <Edit />
          </div>
          <ProfileEditModal isOpen={isModalOpen} onCloseAction={() => setIsModalOpen(false)} onSaveAction={handleSaveProfile} username={user.username} pictureUrl={user.pictureUrl} bio={user.bio} fullName={user.fullName} profileBgUrl={user.profileBgUrl} />
        </div>
      )}
      <div className={isOwnProfile ? 'mx-[16px]' : 'mb-[16px] mt-[60px]'}>
        <div>
          <span className="text-[#F883B8] font-semibold text-[14px]">
            Member
          </span>
          <h1 className="text-[#A0A0A0] font-bold text-[16px] flex items-center">
            <span>@{user.username}</span>
          </h1>
          {user.fullName && <h1 className="text-[24px] text-[#343434] font-bold">{user.fullName}</h1>}
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
          {user.bio && <p className="text-[#5B5B5B] text-[14px] my-[12px]">{user.bio}</p>}
        </div>
      </div>
      <div className="flex">
        <div className="flex-1 flex justify-center">
          <div
            className={clsx(
              "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit",
              tabs === "publications" &&
                "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]"
            )}
            onClick={() => setTabs("publications")}
          >
            {user.posts.length} Publications
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className={clsx(
              "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit",
              tabs === "pins" &&
                "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]"
            )}
            onClick={() => setTabs("pins")}
          >
            {user.pins.length} Pins
          </div>
        </div>
      </div>
      {tabs === "publications" && (
        <>
          {user.posts.length === 0 ? (
            <div className="flex justify-center mt-[10px] text-[#A0A0A0]">
              You don&#39;t have any publications
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
              {user.posts.map((post) => {
                return (
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
              })}
            </div>
          )}
        </>
      )}
      {tabs === "pins" && (
        <>
          {user.pins.length === 0 ? (
            <div className="flex justify-center mt-[10px] text-[#A0A0A0]">
              You don&#39;t have any pinned posts
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
              {user.pins.map((pin) => {
                const post = pin.post;
                return (
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
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
