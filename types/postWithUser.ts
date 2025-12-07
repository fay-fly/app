import { Comment } from "@prisma/client";

export type User = {
  id: number;
  username: string;
  bio: string;
  fullName: string;
  gender: "male" | "female";
  pictureUrl: string;
  profileBgUrl: string;
};

export type Post = {
  id: number;
  text: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  pinsCount: number;
  createdAt: string;
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
  } | null;
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
