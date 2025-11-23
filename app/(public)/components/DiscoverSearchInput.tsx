"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

type RecentSearchResponse =
  | {
      id: number;
      type: "user";
      user: {
        id: number | null;
        username: string | null;
        pictureUrl: string | null;
      };
    }
  | {
      id: number;
      type: "hashtag";
      hashtag: string;
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
  const [recentSearches, setRecentSearches] = useState<RecentSearchResponse[]>(
    []
  );
  const [recentsLoaded, setRecentsLoaded] = useState(false);
  const [recentsLoading, setRecentsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetchRecentSearches = useCallback(async () => {
    setRecentsLoading(true);
    try {
      const response = await axios.get<RecentSearchResponse[]>(
        "/api/search/recent"
      );
      setRecentSearches(response.data ?? []);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setRecentSearches([]);
      } else {
        console.error("Failed to load recent searches", error);
      }
    } finally {
      setRecentsLoaded(true);
      setRecentsLoading(false);
    }
  }, []);

  const recordUserRecent = useCallback(
    async (targetUserId: number) => {
      try {
        await axios.post("/api/search/recent", {
          type: "user",
          userId: targetUserId,
        });
        fetchRecentSearches();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        console.error("Failed to record recent user search", error);
      }
    },
    [fetchRecentSearches]
  );

  const recordHashtagRecent = useCallback(
    async (hashtagName: string) => {
      try {
        await axios.post("/api/search/recent", {
          type: "hashtag",
          hashtag: hashtagName,
        });
        fetchRecentSearches();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        console.error("Failed to record recent hashtag search", error);
      }
    },
    [fetchRecentSearches]
  );

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
    setIsSearching(false);
  };

  const handleFocus = () => {
    if (!recentsLoaded && !recentsLoading) {
      fetchRecentSearches();
    }
    setDropdownOpen(true);
  };

  const handleOpenProfile = (user: UserSearchResult) => {
    if (!user.username) {
      return;
    }
    void recordUserRecent(user.id);
    router.push(`/profile/${user.username}`);
    handleClear();
  };

  const handleOpenHashtag = (hashtag: string) => {
    void recordHashtagRecent(hashtag);
    router.push(`/discover?hashtag=${encodeURIComponent(hashtag)}`);
    handleClear();
  };

  const inputClasses = clsx(
    "w-full rounded-full border border-gray-200 bg-gray-50 text-(--fly-text-primary)",
    "focus:border-(--fly-primary) focus:outline-none",
    variant === "desktop" ? "px-4 py-2 text-sm" : "px-3 py-2 text-sm"
  );

  const trimmedValue = value.trim();
  const hasQuery = trimmedValue.length > 0;
  const shouldShowDropdown =
    dropdownOpen && (hasQuery || recentsLoaded || recentsLoading);
  const isHashtagMode = resultType === "hashtags";
  const showRecentList = dropdownOpen && !hasQuery;
  const headerLabel = showRecentList
    ? "Recent searches"
    : isHashtagMode
    ? "Matching hashtags"
    : "Matching users";

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
              {headerLabel}
            </span>
            {!showRecentList && isSearching && (
              <span className="text-sm text-[#A0A0A0]">Searching...</span>
            )}
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {showRecentList ? (
              recentsLoading ? (
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
              ) : recentsLoaded && recentSearches.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {recentSearches.map((item) => {
                    if (item.type === "user") {
                      if (!item.user || !item.user.username || !item.user.id) {
                        return null;
                      }
                      const recentUser = item.user;
                      return (
                        <button
                          key={`recent-user-${item.id}`}
                          onClick={() =>
                            handleOpenProfile({
                              id: recentUser.id,
                              username: recentUser.username,
                              pictureUrl: recentUser.pictureUrl,
                            })
                          }
                          className="w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-gray-50"
                        >
                          <UserCard
                            showStatus={false}
                            user={{
                              image: recentUser.pictureUrl,
                              username: recentUser.username,
                            }}
                          />
                        </button>
                      );
                    }

                    if (!item.hashtag) {
                      return null;
                    }

                    return (
                      <button
                        key={`recent-hashtag-${item.id}`}
                        onClick={() => handleOpenHashtag(item.hashtag)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-semibold text-(--fly-text-primary)">
                            #{item.hashtag}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-[#A0A0A0]">
                  No recent searches yet
                </div>
              )
            ) : isSearching ? (
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
                      onClick={() => handleOpenProfile(user)}
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
