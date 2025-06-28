export type UserPost = {
  id: number;
  text: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  pinsCount: number;
  createdAt: string;
  author: {
    username: string;
    pictureUrl: string;
  };
};
