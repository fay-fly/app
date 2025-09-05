"use client";

import { useState } from "react";
import axios from "axios";
import { handleError } from "@/utils/errors";
import ReactModal from "react-modal";
import { SubscribeItem } from "@/app/types/subscribeItem";
import Close from "@/icons/Close";
import UserCard from "@/app/(public)/components/UserCard";

type SubsKind = "subscribers" | "subscriptions";

type ViewSubsProps = {
  count: number;
  kind: SubsKind;
  fetchUrl: "/api/users/subscribers" | "/api/users/subscriptions";
  userId: number;
};

export default function ViewSubs({
  count,
  kind,
  fetchUrl,
  userId,
}: ViewSubsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SubscribeItem[]>();

  const openAndFetch = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const res = await axios.get<SubscribeItem[]>(
        `${fetchUrl}?userId=${userId}`
      );
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      handleError(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <li className="cursor-pointer" onClick={openAndFetch}>
        <span className="font-bold text-[#343434]">{count}</span>{" "}
        {kind.charAt(0).toUpperCase() + kind.slice(1)}
      </li>

      <ReactModal
        isOpen={open}
        onRequestClose={close}
        className="w-full max-w-md mx-auto bg-white rounded-lg outline-none"
        overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center px-4"
        ariaHideApp={false}
      >
        <div className="flex items-center justify-between border-b-1 border-gray-200 p-2">
          <h2 className="text-lg font-semibold">
            {kind.charAt(0).toUpperCase() + kind.slice(1)}
          </h2>
          <button
            type="button"
            onClick={close}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            aria-label="Close"
          >
            <Close />
          </button>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="text-center text-gray-600">Loading…</div>
          ) : items && items.length > 0 ? (
            <div className="max-h-96 overflow-auto gap-2">
              {items.map((subscriber) => {
                return (
                  <a key={subscriber.id} href={`/profile/${subscriber.username}`}>
                    <UserCard
                      showStatus={false}
                      user={{
                        image: subscriber.pictureUrl,
                        username: subscriber.username,
                      }}
                    />
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-[#A0A0A0]">
              You don&#39;t have any {kind}
            </div>
          )}
        </div>
      </ReactModal>
    </>
  );
}
