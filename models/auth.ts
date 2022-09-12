import { firestore } from "lib/conn/firestore";

const collection = firestore.collection("auths");

type AuthData = {
  email: string;
  code: number;
  expiration: Date;
  userId: string;
};

export class Auth {
  id: string;
  ref: FirebaseFirestore.DocumentReference;
  data: AuthData;
  constructor(id: string) {
    this.id = id;
    this.ref = collection.doc(id);
  }
  async pull() {
    const snap = await this.ref.get();
    const data = snap.data();
    this.data = data as AuthData;
  }
  async push() {
    await this.ref.update(this.data);
  }
  static trimEmail(email: string) {
    return email.trim().toLowerCase();
  }
  static async findByEmail(emailParam: string) {
    const email = Auth.trimEmail(emailParam);
    const res = await collection.where("email", "==", email).get();
    if (res.docs.length) {
      const doc = res.docs[0];
      const id = doc.id;
      const auth = new Auth(id);
      auth.data = doc.data() as AuthData;
      return auth;
    }
  }
  static async createAuth(data: AuthData) {
    const email = Auth.trimEmail(data.email);

    const newData = {
      email,
      code: data.code,
      expiration: data.expiration,
      userId: data.userId,
    };
    const snapshot = await collection.add(newData);
    const auth = new Auth(snapshot.id);
    auth.data = newData;
    return auth;
  }
  static async getByEmailAndCode(userEmail: string, code: number) {
    const email = Auth.trimEmail(userEmail);
    const snapshot = await collection
      .where("email", "==", email)
      .where("code", "==", code)
      .get();
    if (snapshot.docs.length) {
      const doc = snapshot.docs[0];
      const auth = new Auth(doc.id);
      auth.data = doc.data() as AuthData;
      return auth;
    }
  }
}
