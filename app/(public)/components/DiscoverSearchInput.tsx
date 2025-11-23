"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import UserCard from "@/app/(public)/components/UserCard";
import { handleError } from "@/utils/errors";

type DiscoverSearchInputProps = {
  variant: "desktop" | "mobile";
  wrapperClassName?: string;
};

type UserSearchResult = {
  id: number;
  username: string | null;
  pictureUrl: string | null;
};

type HashtagSearchResult = {
  id: number;
  name: string;
  _count: {
    posts: number;
  };
};

export default function DiscoverSearchInput({
  variant,
  wrapperClassName,
}: DiscoverSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [hashtagResults, setHashtagResults] = useState<HashtagSearchResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [resultType, setResultType] = useState<"users" | "hashtags" | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmedQuery = value.trim();

    if (!trimmedQuery) {
      setUserResults([]);
      setHashtagResults([]);
      setIsSearching(false);
      setResultType(null);
      return;
    }

    const startsWithHash = trimmedQuery.startsWith("#");
    setResultType(startsWithHash ? "hashtags" : "users");
    let cancelled = false;
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        if (startsWithHash) {
          const response = await axios.get<HashtagSearchResult[]>(
            `/api/hashtags/search?query=${encodeURIComponent(trimmedQuery)}`
          );
          if (!cancelled) {
            setHashtagResults(response.data ?? []);
            setUserResults([]);
          }
        } else {
          const response = await axios.get<UserSearchResult[]>(
            `/api/users/search?query=${encodeURIComponent(trimmedQuery)}`
          );
          if (!cancelled) {
            const users = response.data ?? [];
            setUserResults(users);
            setHashtagResults([]);
            if (users.length === 0) {
              const hashtagFallback = await axios.get<HashtagSearchResult[]>(
                `/api/hashtags/search?query=${encodeURIComponent(trimmedQuery)}`
              );
              if (!cancelled) {
                setHashtagResults(hashtagFallback.data ?? []);
                setResultType("hashtags");
              }
            } else {
              setResultType("users");
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          handleError(error);
          setUserResults([]);
          setHashtagResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setValue("");
    setDropdownOpen(false);
    setResultType(null);
    setUserResults([]);
    setHashtagResults([]);
  }, [pathname]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    setDropdownOpen(true);
  };

  const handleClear = () => {
    setValue("");
    setDropdownOpen(false);
    setResultType(null);
    setUserResults([]);
    setHashtagResults([]);
  };

  const handleFocus = () => {
    if (value.trim()) {
      setDropdownOpen(true);
    }
  };

  const handleOpenProfile = (username: string | null) => {
    if (!username) {
      return;
    }
    router.push(`/profile/${username}`);
    handleClear();
  };

  const handleOpenHashtag = (hashtag: string) => {
    router.push(`/discover?hashtag=${encodeURIComponent(hashtag)}`);
    handleClear();
  };

  const inputClasses = clsx(
    "w-full rounded-full border border-gray-200 bg-gray-50 text-(--fly-text-primary)",
    "focus:border-(--fly-primary) focus:outline-none",
    variant === "desktop" ? "px-4 py-2 text-sm" : "px-3 py-2 text-sm"
  );

  const shouldShowDropdown = dropdownOpen && value.trim().length > 0;
  const isHashtagMode = resultType === "hashtags";

  return (
    <div className={clsx("relative", wrapperClassName)} ref={containerRef}>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="Search users or #hashtags"
        className={inputClasses}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666]"
        >
          Clear
        </button>
      )}
      {shouldShowDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="font-semibold text-(--fly-text-primary)">
              {isHashtagMode ? "Matching hashtags" : "Matching users"}
            </span>
            {isSearching && (
              <span className="text-sm text-[#A0A0A0]">Searching...</span>
            )}
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 animate-pulse"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="h-4 w-32 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : isHashtagMode ? (
              hashtagResults.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {hashtagResults.map((hashtag) => (
                    <button
                      key={hashtag.id}
                      onClick={() => handleOpenHashtag(hashtag.name)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-(--fly-text-primary)">
                          #{hashtag.name}
                        </p>
                        <p className="text-sm text-[#909090]">
                          {hashtag._count.posts}{" "}
                          {hashtag._count.posts === 1 ? "post" : "posts"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[#A0A0A0]">
                  No hashtags found
                </div>
              )
            ) : userResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                {userResults.map((user) => {
                  if (!user.username) {
                    return null;
                  }
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleOpenProfile(user.username)}
                      className="w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-gray-50"
                    >
                      <UserCard
                        showStatus={false}
                        user={{
                          image: user.pictureUrl,
                          username: user.username,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-[#A0A0A0]">
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
