import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PostWithUser } from "@/types/postWithUser";

interface HomePostsState {
  posts: PostWithUser[];
  nextCursor: number | null;
  hasMore: boolean;
  loaded: boolean;
  lastFetchedAt: number | null;
  error: string | null;
  scrollPosition: number;
  newPostsCount: number;
  isLoadingNewPosts: boolean;
  isLoadingMore: boolean;
  loadingRequestId: string | null;

  setPosts: (posts: PostWithUser[]) => void;
  appendPosts: (posts: PostWithUser[]) => void;
  prependPosts: (posts: PostWithUser[]) => void;
  setNextCursor: (cursor: number | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  setLastFetchedAt: (timestamp: number | null) => void;
  setError: (error: string | null) => void;
  setScrollPosition: (position: number) => void;
  setNewPostsCount: (count: number) => void;
  setIsLoadingNewPosts: (loading: boolean) => void;
  setIsLoadingMore: (loading: boolean) => void;
  setLoadingRequestId: (id: string | null) => void;
  updatePost: (
    postId: number,
    updates: Partial<PostWithUser>
  ) => void;
  reset: () => void;
}

export const useHomePostsStore = create<HomePostsState>()(
  persist(
    (set) => ({
      posts: [],
      nextCursor: null,
      hasMore: true,
      loaded: false,
      lastFetchedAt: null,
      error: null,
      scrollPosition: 0,
      newPostsCount: 0,
      isLoadingNewPosts: false,
      isLoadingMore: false,
      loadingRequestId: null,

      setPosts: (posts) => set({ posts }),
      appendPosts: (posts) =>
        set((state) => {
          const existingIds = new Set(state.posts.map((p) => p.id));
          const newPosts = posts.filter((p) => !existingIds.has(p.id));
          return { posts: [...state.posts, ...newPosts] };
        }),
      prependPosts: (posts) =>
        set((state) => {
          const existingIds = new Set(state.posts.map((p) => p.id));
          const newPosts = posts.filter((p) => !existingIds.has(p.id));
          return { posts: [...newPosts, ...state.posts] };
        }),
      setNextCursor: (cursor) => set({ nextCursor: cursor }),
      setHasMore: (hasMore) => set({ hasMore }),
      setLoaded: (loaded) => set({ loaded }),
      setLastFetchedAt: (timestamp) => set({ lastFetchedAt: timestamp }),
      setError: (error) => set({ error }),
      setScrollPosition: (position) => set({ scrollPosition: position }),
      setNewPostsCount: (count) => set({ newPostsCount: count }),
      setIsLoadingNewPosts: (loading) => set({ isLoadingNewPosts: loading }),
      setIsLoadingMore: (loading) => set({ isLoadingMore: loading }),
      setLoadingRequestId: (id) => set({ loadingRequestId: id }),
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
          lastFetchedAt: null,
          error: null,
          scrollPosition: 0,
          newPostsCount: 0,
          isLoadingNewPosts: false,
          isLoadingMore: false,
          loadingRequestId: null,
        }),
    }),
    {
      name: "home-posts-storage",
      partialize: (state) => ({
        posts: state.posts,
        nextCursor: state.nextCursor,
        hasMore: state.hasMore,
        loaded: state.loaded,
        scrollPosition: state.scrollPosition,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
