import admin from "firebase-admin";

const servAcc = JSON.parse(process.env.DB_KEY);

if (admin.apps.length == 0) {
  admin.initializeApp({
    credential: admin.credential.cert(servAcc),
  });
}

const firestore = admin.firestore();

export { firestore };
