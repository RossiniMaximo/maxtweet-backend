export type UserData = {
  email?: string;
  fullname?: string;
  pics?: {
    profilePicture?: string;
    coverPicture?: string;
  };
  description?: string;
  tweets?: [{}];
  feed: [{}];
  likes: [{}];
  saves: [{}];
  followers: Array;
  following: Array;
  generatedId: number;
  replies: [{}];
};

export type TweetBody = {
  content?: string;
  img?: any;
  imgURL: string;
  tweetMode?: string;
  profilePicture: string;
};

export type TweetType = {
  id: number;
  userName: string;
  createdAt: Timestamp | Date;
  img: string;
  info: {
    likes: number;
    retweets: number;
    saves: number;
    comments: number;
  }[];
  userId: number;
  mode: string;
  content: string;
  comments: {}[];
};
