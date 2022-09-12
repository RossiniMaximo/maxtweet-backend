import { TweetType } from "custom";
import { firestore } from "lib/conn/firestore";

const collection = firestore.collection("tweets");

/* type TweetType = {
  content?: string;
  img?: string;
  userId: string;
  id: number;
  mode: string;
  createdAt: Date;
  userName: string;
  info: {
    likes: number;
    retweets: number;
    saves: number;
    comments: number;
  }[];
}; */

export class Tweets {
  id: string;
  ref: FirebaseFirestore.DocumentReference;
  data: TweetType;
  constructor(id: string) {
    this.id = id;
    this.ref = collection.doc(id);
  }
  async pull() {
    const snap = await this.ref.get();
    const data = snap.data();
    this.data = data as TweetType;
  }
  async push() {
    await this.ref.update(this.data);
  }
  static async createTweet(data: TweetType) {
    const snapshot = await collection.add(data);
    const tweet = new Tweets(snapshot.id);
    tweet.data = data;
    return tweet;
  }
  static async findById(id: number) {
    const numberId = Number(id);
    const res = await collection.where("id", "==", numberId).get();

    if (res.docs.length) {
      const doc = res.docs[0];
      const tweet = new Tweets(doc.id);
      tweet.data = doc.data() as TweetType;
      return tweet;
    }
  }
  static async findAllByUserId(id: string) {
    const res = await collection.where("userId", "==", id).get();
    if (res.docs.length) {
      const result = res.docs.map((item, index) => {
        const doc = res.docs[index];
        const tweet = new Tweets(doc.id);
        tweet.data = doc.data() as TweetType;
        return tweet.data;
      });
      return result;
    }
  }
  static async getAll() {
    const coll = await collection.get();
    const docs = coll.docs;
    const tweets = docs.map((d) => {
      return d.data();
    });
    return tweets;
  }
}
