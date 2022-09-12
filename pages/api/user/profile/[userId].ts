import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { getOthersProfile } from "controllers/user";

//En este endpoint obtengo la info del usuario a visitar.

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  const result = await getOthersProfile(Number(userId));
  res.send(result);
}
async function handleOptions(req, res) {
  res.send({ status: "ok" });
}

const handler = methods({
  get: handleGet,
  options: handleOptions,
});

export default handler;
