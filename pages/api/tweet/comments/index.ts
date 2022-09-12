import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { authMiddleware } from "lib/middlewares/auth";
import { addComment } from "controllers/tweets";

async function handlePost(req: NextApiRequest, res: NextApiResponse, token) {
  const result = await addComment(req.body, token);
  res.send(result);
}

async function handleOptions(req: NextApiRequest, res: NextApiResponse) {
  res.send(200);
}
const handler = methods({
  post: authMiddleware(handlePost),
  options: handleOptions,
});

export default handler;
