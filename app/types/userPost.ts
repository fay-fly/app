export type UserPost = {
  id: number;
  text: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  pinsCount: number;
  createdAt: string;
  author: {
    id: number;
    username: string;
    pictureUrl: string;
  };
};
