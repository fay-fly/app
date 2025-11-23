"use client";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import PostsPreview from "@/app/(public)/discover/components/PostsPreview";
import UserCard from "@/app/(public)/components/UserCard";
import { handleError } from "@/utils/errors";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function Discover() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeHashtag = searchParams.get("hashtag");

  const [posts, setPosts] = useState<PostWithUser[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [hashtagResults, setHashtagResults] = useState<HashtagSearchResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [resultType, setResultType] = useState<"users" | "hashtags" | null>(
    null
  );

  const clearHashtagFilter = () => {
    router.push("/discover");
  };

  useEffect(() => {
    let cancelled = false;
    setPosts(undefined);

    const endpoint = activeHashtag
      ? `/api/posts/byHashtag?name=${encodeURIComponent(activeHashtag)}`
      : "/api/posts/all";

    axios
      .get<PostWithUser[]>(endpoint)
      .then((response) => {
        if (!cancelled) {
          setPosts(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          handleError(error);
          setPosts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeHashtag]);

  useEffect(() => {
    const trimmedQuery = searchTerm.trim();

    if (!trimmedQuery) {
      setUserResults([]);
      setHashtagResults([]);
      setResultType(null);
      setIsSearching(false);
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
  }, [searchTerm]);

  const hasQuery = searchTerm.trim().length > 0;
  const isHashtagQuery = resultType === "hashtags";

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="w-full bg-white h-auto min-h-full pb-[48px] md:pb-0 ">
      <div className="w-full h-full mr-auto ml-auto max-w-[1000px]">
        <div className="px-4 md:px-0 py-6 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-(--fly-text-primary)">
            Discover creators
          </h1>
          <p className="text-sm text-[#666] mt-1">
            Search by username or explore posts with #hashtags.
          </p>
          <div className="mt-4">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by username or #hashtag"
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-(--fly-text-primary) focus:border-(--fly-primary) focus:outline-none"
            />
          </div>
          {activeHashtag && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-(--fly-primary)/30 bg-(--fly-primary)/5 px-4 py-3 text-sm text-(--fly-text-primary)">
              <span>
                Showing posts for{" "}
                <span className="font-semibold">#{activeHashtag}</span>
              </span>
              <button
                type="button"
                onClick={clearHashtagFilter}
                className="rounded-full border border-(--fly-primary) px-3 py-1 text-(--fly-primary) transition hover:bg-(--fly-primary)/10"
              >
                Clear filter
              </button>
            </div>
          )}
          {hasQuery && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="font-semibold text-(--fly-text-primary)">
                  {isHashtagQuery ? "Matching hashtags" : "Matching users"}
                </span>
                {isSearching && (
                  <span className="text-sm text-[#A0A0A0]">Searching...</span>
                )}
              </div>
              <div className="p-4">
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
                ) : isHashtagQuery ? (
                  hashtagResults.length > 0 ? (
                    <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                      {hashtagResults.map((hashtag) => (
                        <Link
                          key={hashtag.id}
                          href={`/discover?hashtag=${encodeURIComponent(
                            hashtag.name
                          )}`}
                          className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
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
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-[#A0A0A0]">
                      No hashtags found
                    </div>
                  )
                ) : userResults.length > 0 ? (
                  <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                    {userResults.map((user) => {
                      if (!user.username) {
                        return null;
                      }

                      return (
                        <Link
                          key={user.id}
                          href={`/profile/${user.username}`}
                          className="rounded-xl px-2 py-2 text-left transition-colors hover:bg-gray-50"
                        >
                          <UserCard
                            showStatus={false}
                            user={{
                              image: user.pictureUrl,
                              username: user.username,
                            }}
                          />
                        </Link>
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

        <div className="px-0 py-6">
          {!posts ? (
            <div className="grid grid-cols-3 gap-[2px]">
              {[...Array(18)].map((_, index) => (
                <div
                  key={index}
                  className="w-full aspect-square bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <PostsPreview posts={posts} />
          )}
        </div>
      </div>
    </div>
  );
}
