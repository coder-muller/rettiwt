export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type FeedPostView = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  likeCount: number;
  likedByMe: boolean;
  isOwner: boolean;
};

export type ProfileView = {
  userId: string;
  username: string;
  name: string;
  bio: string;
  avatar: string | null;
  joinedAt: Date;
  postCount: number;
  isOwner: boolean;
};
