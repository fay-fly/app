"use client";
import { useEffect, useState } from "react";
import { UserWithPosts } from "@/app/types/postWithUser";
import axios from "axios";

export default function ProfileContent({ id }: { id: number }) {
  const [user, setUser] = useState<UserWithPosts>();

  useEffect(() => {
    axios.get<UserWithPosts>(`/api/users/get?id=${id}`).then((response) => {
      setUser(response.data);
    });
  }, [id]);

  return (
    user && (
      <div className="w-full max-w-[1000px] mx-auto">
        <div
          className="h-[124px] relative"
          style={{
            background:
              "linear-gradient(135deg, #d8ddff 0%, #a2aaff 50%, #7c89ff 100%)",
          }}
        >
          <div className="absolute -bottom-[48px] left-4 flex items-end gap-[24px]">
            <div
              className="w-[80px] h-[80px] rounded-full bg-(--fly-primary) flex items-center justify-center text-white font-bold text-[22px] ring-[1.5px] ring-white z-10">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex mt-[12px] gap-[16px]">
              <label className="flex flex-col items-center">
                <span className="text-[#343434] font-semibold">12</span>
                <span className="text-[#A0A0A0] text-[12px]">Pins</span>
              </label>
              <label className="flex flex-col items-center">
                <span className="text-[#343434] font-semibold">115</span>
                <span className="text-[#A0A0A0] text-[12px]">Subscribers</span>
              </label>
              <label className="flex flex-col items-center">
                <span className="text-[#343434] font-semibold">115</span>
                <span className="text-[#A0A0A0] text-[12px]">
                  Subscriptions
                </span>
              </label>
            </div>
          </div>
        </div>
        <div className="mx-[16px]">
          <div className="p-4 flex items-center space-x-4 relative"></div>
          <div className="mt-[24px]">
            <span className="text-[#A0A0A0] font-semibold text-[14px]">
              Member
            </span>
            <h1 className="text-[#343434] font-bold text-[24px]">
              {user.username}
            </h1>
            <p className="text-[#5B5B5B] my-[12px]">
              I like beautiful people 😜
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[2px] mt-[52px]">
          {user.posts.map((post) => {
            return (
              <div
                key={post.id}
                className="w-full aspect-square overflow-hidden bg-gray-100"
              >
                <img
                  src={post.imageUrl}
                  alt="publication"
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}
