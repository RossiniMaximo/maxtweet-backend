import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { getUserFeed } from "controllers/user";
import { authMiddleware } from "lib/middlewares/auth";

async function handleGetFeed(req: NextApiRequest, res: NextApiResponse, token) {
  const { authId } = token;
  const feed = await getUserFeed(authId);

  res.send(feed);
}
async function handleOptions(req, res) {
  res.send({ status: "ok" });
}

export default methods({
  get: authMiddleware(handleGetFeed),
  options: handleOptions,
});
