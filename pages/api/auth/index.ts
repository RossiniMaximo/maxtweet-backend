import methods from "micro-method-router";
import type { NextApiRequest, NextApiResponse } from "next";
import { sendCode } from "controllers/auth";

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { fullname, email } = req.body;
  const result = await sendCode(email, fullname);
  res.send({ result });
}

function handleOptions(req, res) {
  res.send(200);
}

const handler = methods({
  post: handlePost,
  options: handleOptions,
});

export default handler;
