export type User = {
  id: number;
  username: string;
  pictureUrl: string;
};

export type Post = {
  id: number;
  text: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  pinsCount: number;
  createdAt: string;
};

export type PostWithUser = Post & {
  author: User;
  likedByMe: boolean
};

export type UserWithPosts = User & {
  posts: Post[];
};
