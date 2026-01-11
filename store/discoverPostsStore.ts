import { create } from "zustand";
import { PostWithUser } from "@/types/postWithUser";

interface DiscoverPostsState {
  posts: PostWithUser[];
  nextCursor: number | null;
  hasMore: boolean;
  loaded: boolean;
  isLoadingMore: boolean;
  setPosts: (posts: PostWithUser[]) => void;
  appendPosts: (posts: PostWithUser[]) => void;
  setNextCursor: (cursor: number | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  setIsLoadingMore: (isLoading: boolean) => void;
  updatePost: (
    postId: number,
    updates: Partial<PostWithUser>
  ) => void;
  reset: () => void;
}

export const useDiscoverPostsStore = create<DiscoverPostsState>((set) => ({
  posts: [],
  nextCursor: null,
  hasMore: true,
  loaded: false,
  isLoadingMore: false,

  setPosts: (posts) => set({ posts }),
  appendPosts: (newPosts) =>
    set((state) => {
      const existingIds = new Set(state.posts.map((p) => p.id));
      const uniqueNewPosts = newPosts.filter((p) => !existingIds.has(p.id));
      return { posts: [...state.posts, ...uniqueNewPosts] };
    }),
  setNextCursor: (nextCursor) => set({ nextCursor }),
  setHasMore: (hasMore) => set({ hasMore }),
  setLoaded: (loaded) => set({ loaded }),
  setIsLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...updates } : post
      ),
    })),
  reset: () =>
    set({
      posts: [],
      nextCursor: null,
      hasMore: true,
      loaded: false,
      isLoadingMore: false,
    }),
}));
