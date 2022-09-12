import { UserData } from "custom";
import { firestore } from "lib/conn/firestore";

const collection = firestore.collection("users");

export class User {
  ref: FirebaseFirestore.DocumentReference;
  data: UserData;
  id: string;
  constructor(id: string) {
    this.id = id;
    this.ref = collection.doc(id);
  }
  async push() {
    await this.ref.update(this.data);
  }
  async pull() {
    const snap = await this.ref.get();
    const data = snap.data();
    this.data = data as UserData;
  }
  static async createUser(data: UserData) {
    const email = data.email.trim().toLowerCase();
    const newData = {
      email,
      fullname: data.fullname,
      pics: {
        profilePicture: data.pics.profilePicture,
        coverPicture: data.pics.coverPicture,
      },
      description: data.description,
      tweets: data.tweets || [{}],
      followers: [],
      following: [],
      likes: data.likes || [{}],
      saves: data.saves || [{}],
      feed: data.feed || [{}],
      generatedId: data.generatedId,
      replies: data.replies || [{}],
    };
    const snapshot = await collection.add(newData);
    const user = new User(snapshot.id);
    user.data = newData;
    user.data.tweets.pop();
    await user.push();
    return user;
  }
  static async findById(userId: number) {
    const snapshot = await collection
      .where("generatedId", "==", Number(userId))
      .get();
    if (snapshot.docs.length) {
      {
        const doc = snapshot.docs[0];
        const user = new User(doc.id);
        user.data = doc.data() as UserData;
        return user;
      }
    }
  }
  static async getAll() {
    const usersSnapshot = await collection.get();
    const users = usersSnapshot.docs.map((d) => {
      const data = d.data();
      return data;
    });
    return users;
  }
}
