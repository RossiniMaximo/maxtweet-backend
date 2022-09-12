import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { getAllTweetsFromUser } from "controllers/user";

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.id;
  const tweets = await getAllTweetsFromUser(Number(userId));
  res.send(tweets);
}

async function handleOptions(req, res) {
  res.status(200).send({ status: "ok" });
}

const handler = methods({
  get: handleGet,
  options: handleOptions,
});

export default handler;
