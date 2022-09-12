import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { getAllUsers } from "../../../controllers/user";

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.search as string;
  const result = await getAllUsers(query);
  res.send(result);
}

function handleOptions(req, res) {
  res.send(200);
}
const handler = methods({
  get: handleGet,
  options: handleOptions,
});

export default handler;
