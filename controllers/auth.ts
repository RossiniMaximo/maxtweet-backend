import { Auth } from "models/auth";
import { User } from "models/user";
import randomInteger from "random-int";
import { addMinutes } from "date-fns";
import { createToken } from "lib/jwt";
import { mailSender } from "controllers/email";

export async function findOrCreate(email: string, fullname: string) {
  const exists = await Auth.findByEmail(email);
  if (exists) {
    return exists;
  }
  let generatedId = randomInteger(10000, 99999);
  const user = await User.createUser({
    email,
    fullname,
    pics: { profilePicture: "", coverPicture: "" },
    description: "",
    tweets: null,
    feed: null,
    followers: [generatedId],
    following: null,
    likes: null,
    saves: null,
    replies: null,
    generatedId: generatedId,
  });
  const auth = await Auth.createAuth({
    email,
    code: null,
    expiration: null,
    userId: user.id,
  });
  return auth;
}

export async function sendCode(email: string, fullname: string) {
  const auth = await findOrCreate(email, fullname);
  if (auth) {
    let code = randomInteger(10000, 99999);
    const expiration = addMinutes(new Date(), 20);
    auth.data.code = code;
    auth.data.expiration = expiration;
    await auth.push();
    mailSender({ email, fullname, code });
    return true;
  } else {
    return "Authentication failed.";
  }
}

export async function authenticate(email: string, code: number) {
  const auth = await Auth.getByEmailAndCode(email, code);
  if (auth) {
    (auth.data.code = null), (auth.data.expiration = null);
    await auth.push();
    const token = createToken(auth.id);
    return { token };
  }
}
