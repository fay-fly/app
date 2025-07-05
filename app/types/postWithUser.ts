type User = {
  id: number;
  username: string;
  pictureUrl: string;
};

type Post = {
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
};

export type UserWithPosts = User & {
  posts: Post[];
};
