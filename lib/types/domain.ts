export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type CommentView = {
  id: string;
  postId: string;
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  canDelete: boolean;
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
  commentCount: number;
  commentPreview: CommentView[];
};

export type ProfileView = {
  userId: string;
  username: string;
  name: string;
  bio: string;
  avatar: string | null;
  joinedAt: Date;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isOwner: boolean;
  isFollowingByMe: boolean;
  followsMe: boolean;
  canMessage: boolean;
};

export type UserSearchResult = {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isFollowingByMe: boolean;
};

export type ConversationListItem = {
  conversationId: string;
  peer: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: Date;
};

export type MessageView = {
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  isMine: boolean;
};

export type NotificationView = {
  id: string;
  type: "POST_LIKED" | "POST_COMMENTED" | "USER_FOLLOWED";
  createdAt: Date;
  readAt: Date | null;
  actor: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  postId: string | null;
  commentId: string | null;
};
