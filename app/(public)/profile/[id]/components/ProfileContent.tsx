"use client";
import { useEffect, useState } from "react";
import { UserWithPosts } from "@/app/types/postWithUser";
import axios from "axios";
import Image from "next/image";
import PageLoader from "@/components/PageLoader";
import clsx from "clsx";
import Link from "next/link";

export default function ProfileContent({ id }: { id: number }) {
  const [tabs, setTabs] = useState<"publications" | "pins">("publications");
  const [user, setUser] = useState<UserWithPosts>();

  useEffect(() => {
    axios.get<UserWithPosts>(`/api/users/get?id=${id}`).then((response) => {
      setUser(response.data);
    });
  }, [id]);

  return (
    !user ? <PageLoader /> : (
      <div className="w-full max-w-[1000px] mx-auto pb-[48px] md:pb-0">
        <div
          className="h-[124px] relative"
          style={{
            background:
              "linear-gradient(135deg, #d8ddff 0%, #a2aaff 50%, #7c89ff 100%)",
          }}
        >
          <div className="absolute -bottom-[48px] left-4 flex items-end gap-[24px]">
            {user.pictureUrl
              ? <img src={user.pictureUrl} alt="profile picture" className="ring-[1.5px] ring-white z-10 w-[80px] h-[80px] rounded-full" />
              : <div
                className="w-[80px] h-[80px] rounded-full bg-(--fly-primary) flex items-center justify-center text-white font-bold text-[22px] ring-[1.5px] ring-white z-10">
                {user.username.charAt(0).toUpperCase()}
              </div>}
          </div>
        </div>
        <div className="mx-[16px]">
          <div className="p-4 flex items-center space-x-4 relative"></div>
          <div className="mt-[24px]">
            <span className="text-[#F883B8] font-semibold text-[14px]">
              Member
            </span>
            <h1 className="text-[#A0A0A0] font-bold text-[16px] flex items-center">
              <span>@{user.username}</span>
            </h1>
            <ul className="flex gap-[24px] mt-[10px] text-[#A0A0A0]">
              <li className="cursor-pointer"><span className="font-bold text-[#343434]">{user._count.followers}</span> Subscribers</li>
              <li className="cursor-pointer"><span className="font-bold text-[#343434]">{user._count.subscriptions}</span> Subscriptions</li>
            </ul>
            <p className="text-[#5B5B5B] my-[12px]">
              Profile desc goes here...
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1 flex justify-center">
            <div className={clsx(
              "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit",
              tabs === "publications" && "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]"
            )} onClick={() => setTabs("publications")}>{user.posts.length} Publications</div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className={clsx(
              "text-[#A0A0A0] cursor-pointer py-[11px] text-[14px] max-w-fit",
              tabs === "pins" && "border-b-2 border-[#F458A3] font-semibold text-[#5B5B5B]"
            )} onClick={() => setTabs("pins")}>{user.pins.length} Pins</div>
          </div>
        </div>
        {tabs === "publications" && <>
          {user.posts.length === 0 ? <div className="flex justify-center mt-[10px] text-[#A0A0A0]">You don&#39;t have any publications</div> : <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
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
          </div>}
        </>}
        {tabs === "pins" && <>
          {user.pins.length === 0 ? <div className="flex justify-center mt-[10px] text-[#A0A0A0]">You don&#39;t have any pinned posts</div> : <div className="grid grid-cols-3 gap-[2px] mt-[15px]">
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
          </div>}
        </>}
      </div>
    )
  );
}
