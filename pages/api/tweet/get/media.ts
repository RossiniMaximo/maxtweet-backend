import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { getTweetsWithMedia } from "controllers/tweets";

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const result = await getTweetsWithMedia();
  res.send(result);
}
async function handleOptions(req: NextApiRequest, res: NextApiResponse) {
  res.send(200);
}

export default methods({
  get: handleGet,
  options: handleOptions,
});
