import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { getMostFollowedUsers } from "controllers/user";

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const result = await getMostFollowedUsers();
  res.send(result);
}

function handleOptions(req: NextApiRequest, res: NextApiResponse) {
  res.send(200);
}

const handler = methods({
  get: handleGet,
  options: handleOptions,
});

export default handler;
