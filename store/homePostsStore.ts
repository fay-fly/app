import { create } from "zustand";
import { PostWithUser } from "@/app/types/postWithUser";

interface HomePostsState {
  posts: PostWithUser[];
  nextCursor: number | null;
  hasMore: boolean;
  loaded: boolean;
  setPosts: (posts: PostWithUser[]) => void;
  appendPosts: (posts: PostWithUser[]) => void;
  setNextCursor: (cursor: number | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  updatePost: (postId: number, updates: Partial<PostWithUser>) => void;
  reset: () => void;
}

export const useHomePostsStore = create<HomePostsState>((set) => ({
  posts: [],
  nextCursor: null,
  hasMore: true,
  loaded: false,

  setPosts: (posts) => set({ posts }),
  appendPosts: (posts) =>
    set((state) => ({ posts: [...state.posts, ...posts] })),
  setNextCursor: (cursor) => set({ nextCursor: cursor }),
  setHasMore: (hasMore) => set({ hasMore }),
  setLoaded: (loaded) => set({ loaded }),
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
    }),
}));
