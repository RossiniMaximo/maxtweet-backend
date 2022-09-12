import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { authMiddleware } from "lib/middlewares/auth";
import {
  addFollower,
  getMe,
  handleUnfollow,
  updateUserProfile,
} from "controllers/user";

async function handleGet(req: NextApiRequest, res: NextApiResponse, token) {
  const me = await getMe(token.authId);
  res.send({ me: me.data });
}

// Actualiza la data del usuario.
async function handlePatch(req: NextApiRequest, res: NextApiResponse, token) {
  const update = await updateUserProfile(req.body, token);
  res.send({ update });
}

// Esta parte me parece que queda media extraña aca.

// Follow
async function handlePost(req: NextApiRequest, res: NextApiResponse, token) {
  const followedId = req.query.userId as any;
  const { authId } = token;
  const result = await addFollower(followedId, authId);
  res.send(result);
}

// Unfollow
async function handleDelete(req: NextApiRequest, res: NextApiResponse, token) {
  const { authId } = token;
  const unfollowedUserId = req.query.userId;
  const result = await handleUnfollow(unfollowedUserId, authId);
  res.send(result);
}
async function handleOptions(req, res) {
  res.send({ status: "ok" });
}

const handler = methods({
  get: authMiddleware(handleGet),
  patch: authMiddleware(handlePatch),
  post: authMiddleware(handlePost),
  delete: authMiddleware(handleDelete),
  options: handleOptions,
});

export default handler;
