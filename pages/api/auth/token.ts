import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { authenticate } from "controllers/auth";

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { email, code } = req.body;
  const result = await authenticate(email, code);
  res.send(result);
}

function handleOptions(req, res) {
  res.send(200);
}

export default methods({
  post: handlePost,
  options: handleOptions,
});
