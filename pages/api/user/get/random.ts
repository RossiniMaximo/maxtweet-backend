// In top option I could bring most followed users.
import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { get10RandomsUsers } from "controllers/user";

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const result = await get10RandomsUsers();
  res.send(result);
}
async function handleOptions(req: NextApiRequest, res: NextApiResponse) {
  res.send(200);
}

export default methods({
  get: handleGet,
  options: handleOptions,
});
