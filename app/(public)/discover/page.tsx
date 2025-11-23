"use client";
import type { PostWithUser } from "@/app/types/postWithUser";
import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import PostsPreview from "@/app/(public)/discover/components/PostsPreview";
import UserCard from "@/app/(public)/components/UserCard";
import { handleError } from "@/utils/errors";

type UserSearchResult = {
  id: number;
  username: string | null;
  pictureUrl: string | null;
};

export default function Discover() {
  const [posts, setPosts] = useState<PostWithUser[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    axios.get<PostWithUser[]>("/api/posts/all").then((response) => {
      setPosts(response.data);
    });
  }, []);

  useEffect(() => {
    const trimmedQuery = searchTerm.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await axios.get<UserSearchResult[]>(
          `/api/users/search?query=${encodeURIComponent(trimmedQuery)}`
        );
        if (!cancelled) {
          setSearchResults(response.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          handleError(error);
          setSearchResults([]);
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
            Search by username to jump straight to someone&apos;s profile.
          </p>
          <div className="mt-4">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by username"
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-(--fly-text-primary) focus:border-(--fly-primary) focus:outline-none"
            />
          </div>
          {hasQuery && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="font-semibold text-(--fly-text-primary)">
                  Matching users
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
                ) : searchResults.length > 0 ? (
                  <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                    {searchResults.map((user) => {
                      if (!user.username) {
                        return null;
                      }

                      return (
                        <a
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
                        </a>
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
