import { create } from "zustand";
import { HydratedPostWithUser } from "@/types/postWithUser";

interface DiscoverPostsState {
  posts: HydratedPostWithUser[];
  loaded: boolean;
  setPosts: (posts: HydratedPostWithUser[]) => void;
  setLoaded: (loaded: boolean) => void;
  updatePost: (
    postId: number,
    updates: Partial<HydratedPostWithUser>
  ) => void;
  reset: () => void;
}

export const useDiscoverPostsStore = create<DiscoverPostsState>((set) => ({
  posts: [],
  loaded: false,

  setPosts: (posts) => set({ posts }),
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
      loaded: false,
    }),
}));
