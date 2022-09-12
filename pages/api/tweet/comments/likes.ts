import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { likeComment, dislikeComment } from "controllers/tweets";
import { authMiddleware } from "lib/middlewares/auth";

// Crear un post para  añadir  el like a un comentario.

async function handlePost(req: NextApiRequest, res: NextApiResponse, token) {
  const { tweetId, replyId } = req.body;
  const result = await likeComment(tweetId, replyId, token);
  res.send(result);
}

// Crear un delete para borrar los likes.

async function handleDelete(req: NextApiRequest, res: NextApiResponse, token) {
  const { tweetId, replyId } = req.body;
  const result = await dislikeComment(tweetId, replyId, token);
  res.send(result);
}

async function handleOptions(req: NextApiRequest, res: NextApiResponse) {
  res.send(200);
}

const handler = methods({
  post: authMiddleware(handlePost),
  delete: authMiddleware(handleDelete),
  options: handleOptions,
});

export default handler;
