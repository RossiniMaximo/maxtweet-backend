// Receive the actions : like , retweet,comment,save, to add them in the tweet actions count.
import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { authMiddleware } from "lib/middlewares/auth";
import {
  tweetActionCounterUpdater,
  tweetActionStatusRemover,
} from "controllers/tweets";

async function handlePost(req: NextApiRequest, res: NextApiResponse, authId) {
  const { action, tweetId } = req.body;
  const token = authId.authId;
  const result = await tweetActionCounterUpdater(action, tweetId, token);
  res.send(result);
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { action, tweetId } = req.body;
  const result = await tweetActionStatusRemover(action, tweetId);
  res.send(result);
}

async function handleOptions(req, res) {
  res.send({ status: "ok" });
}

const handler = methods({
  post: authMiddleware(handlePost),
  delete: authMiddleware(handleDelete),
  options: handleOptions,
});
export default handler;
