import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { authMiddleware } from "lib/middlewares/auth";
import {
  createTweet,
  getTweetById,
  deleteTweetById,
  updateOneTweet,
} from "controllers/tweets";

async function handlePostTweet(
  req: NextApiRequest,
  res: NextApiResponse,
  token
) {
  const created = await createTweet(req.body, token);
  res.send({ created });
}
async function handleGetTweet(req: NextApiRequest, res: NextApiResponse) {
  const tweet = await getTweetById(req.query.id as any);
  res.send({ tweet: tweet.data });
}

async function handleDeleteTweet(
  req: NextApiRequest,
  res: NextApiResponse,
  token
) {
  const { tweetId } = req.body;
  const result = await deleteTweetById(tweetId);
  res.send(result);
}

async function handlePatchTweet(
  req: NextApiRequest,
  res: NextApiResponse,
  token
) {
  const { tweetId, newData } = req.body;
  const tweetIdToNumber = Number(tweetId);
  const result = await updateOneTweet(tweetIdToNumber, newData);
  res.send(result);
}
async function handleOptions(req, res) {
  res.send({ status: "ok" });
}

const handler = methods({
  post: authMiddleware(handlePostTweet),
  get: handleGetTweet,
  delete: authMiddleware(handleDeleteTweet),
  patch: authMiddleware(handlePatchTweet),
  options: handleOptions,
});

export default handler;
