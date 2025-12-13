import { Comment } from "@prisma/client";

export type User = {
  id: number;
  username: string;
  bio: string;
  fullName: string;
  gender: "male" | "female";
  pictureUrl: string;
  profileBgUrl: string;
  role: string;
  emailVerified: boolean;
};

export type PostMediaItem = {
  url: string;
  width: number;
  height: number;
};

export type Post = {
  id: number;
  text: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  pinsCount: number;
  createdAt: string;
  media?: PostMediaItem[];
};

export type PostWithUser = Post & {
  author: User;
  likedByMe: boolean;
  pinnedByMe: boolean;
  isFollowed: boolean;
  isPinned?: boolean;
  pinnedBy?: {
    id: number;
    username: string;
    pictureUrl: string;
    role?: string;
  } | null;
};

export type HydratedPostWithUser = PostWithUser & {
  media: PostMediaItem[];
};

type SubsCount = {
  _count: {
    followers: number;
    subscriptions: number;
  };
};

export type CommentWithUser = Comment & {
  author: User;
};

export type UserWithPosts = User &
  SubsCount & {
    posts: Post[];
    pins: {
      post: Post;
    }[];
    isFollowedByMe: boolean;
  };
