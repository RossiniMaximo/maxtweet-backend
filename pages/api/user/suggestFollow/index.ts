import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { authMiddleware } from "lib/middlewares/auth";
import { getWhoToFollow } from "controllers/user";

async function handleGetSuggestions(
  req: NextApiRequest,
  res: NextApiResponse,
  token
) {
  const suggested = await getWhoToFollow(token);
  res.send(suggested);
}

async function handleOptions(req, res) {
  res.send(200);
}

const handler = methods({
  get: authMiddleware(handleGetSuggestions),
  options: handleOptions,
});

export default handler;
