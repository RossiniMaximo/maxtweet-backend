import { TweetBody, TweetType } from "custom";
import randomInteger from "random-int";
import { getMe, saveAction } from "./user";
import { Tweets } from "models/tweets";
import { User } from "models/user";
import isAfter from "date-fns/isAfter";

export async function createTweet(tweetBody: TweetBody, token) {
  const user = await getMe(token.authId);
  const id = randomInteger(10000, 99999);
  const shapeTweet = {
    userName: user.data.fullname,
    userId: user.data.generatedId,
    profilePicture: user.data.pics.profilePicture,
    content: tweetBody.content,
    img: tweetBody.imgURL || "",
    createdAt: new Date(),
    mode: tweetBody.tweetMode,
    id: id,
    info: [{ likes: 0, retweets: 0, saves: 0, comments: 0 }],
    comments: [{}],
  };
  user.data.tweets.push(shapeTweet);
  user.data.feed.push(shapeTweet);
  await user.push();
  const tweet = await Tweets.createTweet(shapeTweet);
  user.data.followers.map(async (followerId) => {
    const follower = await User.findById(followerId);
    await follower.pull();
    follower.data.feed.push(tweet.data);
    await follower.push();
  });

  return true;
}

export async function getTweetById(tweetId: number) {
  const tweet = await Tweets.findById(tweetId);
  return tweet;
}

export async function deleteTweetById(tweetId) {
  const id = Number(tweetId);
  const tweet = await Tweets.findById(id);

  const userId = tweet.data.userId;
  const user = await User.findById(userId);

  const result = user.data.tweets.find((tweet: any) => {
    if (tweet.id == id) {
      return tweet;
    }
  });

  // El index devuelve la posición del tweet encontrado en el array
  // Para luego removerlo usando splice
  const index = user.data.tweets.indexOf(result);

  if (index > -1) {
    // Splice va a remover el elemento que coincida con la posición del index y va a remover ese elemento
    // debido al 1.(remover 1 elemento)
    user.data.tweets.splice(index, 1);
    await user.push();
  }

  user.data.followers.map(async (f) => {
    const follower = await User.findById(f);
    follower.data.feed.find((t: any, index) => {
      if (t != undefined && t.id == id) {
        follower.data.feed.splice(index, 1);
      }
    });
    follower.data.likes.find((t: any, index) => {
      if (t != undefined && t.id == id) {
        follower.data.likes.splice(index, 1);
      }
    });

    follower.data.saves.find((t: any, index) => {
      if (t != undefined && t.id == id) {
        follower.data.saves.splice(index, 1);
      }
    });

    await follower.push();
  });

  await tweet.ref.delete();
  return { deleted: true };
}

export async function updateOneTweet(tweetId: number, body: TweetBody) {
  const tweet = await Tweets.findById(tweetId);
  const userId = tweet.data.userId;
  const user = await User.findById(userId);
  await user.pull();

  // Aca actualiza el tweet de la colección Tweets.
  if (body.content) {
    tweet.data.content = body.content;
  }
  if (body.img) {
    tweet.data.img = body.img;
  }
  await tweet.push();

  // Aca actualiza el tweet del usuario dentro de  la colleción Usuarios.

  user.data.tweets.find(async (tweet: any) => {
    if (tweet.id == tweetId) {
      tweet.content = body.content || "";
      tweet.img = body.img || "";
      tweet.tweetMode = body.tweetMode || "";
      await user.push();
    }
  });

  // Aca Actualiza el tweet dentro del feed de los usuarios seguidores del usuario padre.

  user.data.followers.map(async (userIds) => {
    const userFollower = await User.findById(userIds);
    await userFollower.pull();
    const result = userFollower.data.feed.find(async (t: any) => {
      if (t.id == tweetId) {
        t.content = tweet.data.content;
        t.img = tweet.data.img;
        t.tweetMode = tweet.data.mode;
        await userFollower.push();
      }
    });
    return result;
  });
}

// Suma 1 al contador de la action correspondiente al tweet obtenido mediante el tweetId.

export async function tweetActionCounterUpdater(
  action: string,
  tweetId: number,
  token
) {
  // Aca obtiene las referencias a los tweets de las collections Tweet y User
  // para actualizarle los datos a sus respectivos docs y a el feed de sus followers.

  const tweetRef = await getTweetById(tweetId);
  const tweetOwnerRef = await User.findById(tweetRef.data.userId);

  const ownerTweet: any = tweetOwnerRef.data.tweets.find((t: any) => {
    if (t.id == tweetId) {
      return t;
    }
  });

  const tweetInFollowerFeedAndFollower = await Promise.allSettled(
    tweetOwnerRef.data.followers.map(async (f) => {
      const followerRef = await User.findById(f);
      const tweet = followerRef?.data.feed.find((t: any) => {
        if (t.id == tweetId) {
          return t;
        }
      });
      return { tweet, followerRef: followerRef };
    })
  );
  //  Here deconstructs the tweetInFollowerFeedAndFollower response.
  const followerReference = tweetInFollowerFeedAndFollower[0].value.followerRef;
  const tweetInFollowerFeed = tweetInFollowerFeedAndFollower[0].value.tweet;

  // Aca aplica los cambios dentro de los objetos que acabamos de referenciar.

  if (action == "like") {
    tweetRef.data.info[0].likes += 1;
    ownerTweet.info[0].likes += 1;
    tweetInFollowerFeed ? (tweetInFollowerFeed.info[0].likes += 1) : "";
  } else if (action == "retweet") {
    tweetRef.data.info[0].retweets += 1;
    ownerTweet.info[0].retweets += 1;
    tweetInFollowerFeed ? (tweetInFollowerFeed.info[0].retweets += 1) : "";
  } else if (action == "save") {
    tweetRef.data.info[0].saves += 1;
    ownerTweet.info[0].saves += 1;
    tweetInFollowerFeed ? (tweetInFollowerFeed.info[0].saves += 1) : "";
  } else {
    tweetRef.data.info[0].comments += 1;
    ownerTweet.info[0].comments += 1;
    tweetInFollowerFeed ? (tweetInFollowerFeed.info[0].comments += 1) : "";
  }

  // Aca pushea los datos cambiados previamente para actualizar la información de la referencia.

  await tweetRef.push();
  await tweetOwnerRef.push();
  await saveAction(action, tweetRef, token);
  if (followerReference != undefined) {
    await followerReference.push();
  }
  return tweetRef.data.info;
}

// Remueve la tweet action dentro de los tweets del tweet owner  , del tweet owener followers feed
// y de la collection Tweets.

export async function tweetActionStatusRemover(
  action: string,
  tweetId: number
) {
  // Aca crea las referencias a el tweet owner,tweet en Tweet collection y
  // tweet owner followers feed tweet.

  const tweet = await getTweetById(tweetId);

  const tweetOwnerRef = await User.findById(tweet.data.userId);
  const tweetInOwner: any = tweetOwnerRef.data.tweets.find((tweet: any) => {
    if (tweet.id == tweetId) {
      return tweet;
    }
  });

  const ownerFollowers = tweetOwnerRef.data.followers;
  const followerAndFeed = await Promise.all(
    ownerFollowers.map(async (follower) => {
      const followerCopy = await User.findById(follower);
      await followerCopy.pull();
      const tweetFromFollowerFeed = followerCopy.data.feed.find(
        (tweets: any) => {
          if (tweets.id == tweetId) {
            return tweets;
          }
        }
      );
      return { followerCopy, tweetFromFollowerFeed };
    })
  );
  const follower = followerAndFeed[0].followerCopy;
  const tweetFromFeed = followerAndFeed[0].tweetFromFollowerFeed;

  // Aca aplica los cambios dentro de la referencia.

  if (action == "like") {
    tweet.data.info[0].likes -= 1;
    tweetFromFeed.info[0].likes -= 1;
    tweetInOwner.info[0].likes -= 1;
  } else if (action == "retweet") {
    tweet.data.info[0].retweets -= 1;
    tweetFromFeed.info[0].retweets -= 1;
    tweetInOwner.info[0].retweets -= 1;
  } else if (action == "save") {
    tweet.data.info[0].saves -= 1;
    tweetFromFeed.info[0].saves -= 1;
    tweetInOwner.info[0].saves -= 1;
  } else {
    tweet.data.info[0].comments -= 1;
    tweetFromFeed.info[0].comments -= 1;
    tweetInOwner.info[0].saves -= 1;
  }

  // Aca pushea los datos previamente actualizados.
  await tweet.push();
  await follower.push();
  await tweetOwnerRef.push();
  return tweet.data.info[0];
}

export async function addComment(body, { authId }) {
  // Aca obtengo la referencia al usuario que hace el request para luego añadir su id
  // en la creación del comentario y agregar el comentario a sus replies.

  const me = await getMe(authId);
  let randomId = randomInteger(9999, 100000);
  const newComment = {
    comment: body.newComment.comment,
    userId: body.newComment.userId,
    ia: new Date(),
    id: randomId,
    likes: 0,
    tweetId: body.newComment.tweetId,
    by: body.newComment.by,
    pics: { profilePicture: body.newComment.pics.profilePicture },
  };

  // Aca obtiene la referencia del  tweet en la collection Tweet y al usuario dueño del tweet.

  const tweet = await Tweets.findById(body.newComment.tweetId);
  console.log("TWEET :", tweet);

  const tweetOwnerId = tweet.data.userId;
  console.log("TWEET OWNER ID", tweetOwnerId);

  const tweetOwner = await User.findById(tweetOwnerId);

  // Obtiene el tweet dentro del tweet owner y le pushea el nuevo comentario.

  tweetOwner.data.tweets.find((t: TweetType) => {
    if (t.id == body.newComment.tweetId) {
      t.info[0].comments += 1;
      t.comments.push(newComment);
    }
  });

  // Obtiene los followers del owner y les agrega el comentario a el tweet dentro de el feed, likes y saves.

  tweetOwner.data.followers.map(async (f) => {
    const userFollower = await User.findById(f);
    userFollower.data.feed.find((t: TweetType) => {
      if (t.id == body.newComment.tweetId) {
        t.info[0].comments += 1;
        t.comments.push(newComment);
      }
    });
    userFollower.data.likes.find((t: TweetType) => {
      if (t.id == body.newComment.tweetId) {
        t.info[0].comments += 1;
        t.comments.push(newComment);
      }
    });
    userFollower.data.saves.find((t: TweetType) => {
      if (t.id == body.newComment.tweetId) {
        t.info[0].comments += 1;
        t.comments.push(newComment);
      }
    });
    await userFollower.push();
  });
  me.data.replies.push(newComment);
  tweet.data.comments.push(newComment);

  // Without the IF statement it deleted every reply to my own tweets after being set in the
  // database , I think that was because of the "re-rendering" of the document, one of the re-renders
  //  left the document the way it was before of pushing the new reply.

  if (me.data.generatedId == tweetOwner.data.generatedId) {
    await me.push();
    await tweet.push();
    return true;
  } else {
    await tweet.push();
    await me.push();
    await tweetOwner.push();
    return true;
  }
}

// Add likes to replies.
export async function likeComment(
  tweetId: number,
  replyId: number,
  { authId }
) {
  const tweetRef = await Tweets.findById(tweetId);
  const userId = tweetRef.data.userId;
  const user = await User.findById(userId);
  const me = await getMe(authId);

  // Adds  1 like to the comment  inside of  tweet in Tweet collection.
  tweetRef.data.comments.find((c: any) => {
    if (c.id == replyId) {
      c.likes += 1;
    }
  });

  // Here it adds  a  like to the reply  inside  the  tweet from the tweet owner in collection User.
  user.data.tweets.find((t: TweetType) => {
    if (t.id == tweetId) {
      t.comments.find((c: any) => {
        if (c.id == replyId) {
          c.likes += 1;
        }
      });
    }
  });

  // Adds a  like to the reply  inside the  feed the likes and saves of the followers.
  user.data.followers.map(async (f) => {
    const follower = await User.findById(f);
    follower.data.saves.find((t: TweetType) => {
      if (t.id == tweetId) {
        t.comments.map(async (c: any) => {
          if (c.id == replyId) {
            c.likes += 1;
          }
        });
      }
    });
    follower.data.likes.find((t: TweetType) => {
      if (t.id == tweetId) {
        t.comments.map(async (c: any) => {
          if (c.id == replyId) {
            c.likes += 1;
          }
        });
      }
    });
    follower.data.feed.find((t: TweetType) => {
      if (t.id == tweetId) {
        t.comments.map(async (c: any) => {
          if (c.id == replyId) {
            c.likes += 1;
            await follower.push();
          }
        });
      }
    });
  });

  // Adds a like to the reply inside of the user liker reply's.
  me.data.replies.find((c: any) => {
    if (c.id == replyId) {
      c.likes += 1;
    }
  });
  await tweetRef.push();
  if (user.data.generatedId == me.data.generatedId) {
    await me.push();
  } else {
    await me.push();
    await user.push();
  }
  return true;
}

// Dislike comment.

export async function dislikeComment(
  tweetId: number,
  replyId: number,
  { authId }
) {
  const tweetRef = await Tweets.findById(tweetId);
  const userId = tweetRef.data.userId;
  const user = await User.findById(userId);
  const me = await getMe(authId);

  // Removes  1 like to the tweet inside of  Tweet collection.
  tweetRef.data.comments.find((c: any) => {
    if (c.id == replyId) {
      c.likes -= 1;
    }
  });

  // Here it removes  a  like to the reply  inside  the  tweet from the tweet owener in collection User.

  user.data.tweets.find((t: TweetType) => {
    if (t.id == tweetId) {
      t.comments.find((c: any) => {
        if (c.id == replyId) {
          c.likes -= 1;
        }
      });
    }
  });

  // Removes a  like to the reply  inside the  feed of the followers.
  // Removes a  like to the reply  inside the  liked tweets of the followers.
  // Removes a  like to the reply  inside the  saved tweets of the followers.
  user.data.followers.map(async (f) => {
    const follower = await User.findById(f);
    follower.data.likes.find((t: TweetType) => {
      if (t.id == tweetId) {
        t.comments.map(async (c: any) => {
          if (c.id == replyId) {
            c.likes -= 1;
          }
        });
      }
    });
    follower.data.saves.find((t: TweetType) => {
      if (t.id == tweetId) {
        t.comments.map(async (c: any) => {
          if (c.id == replyId) {
            c.likes -= 1;
          }
        });
      }
    });
    follower.data.feed.find((t: TweetType) => {
      if (t.id == tweetId) {
        t.comments.map(async (c: any) => {
          if (c.id == replyId) {
            c.likes -= 1;
            await follower.push();
          }
        });
      }
    });
  });

  // Removes 1 like a el comentario dentro del apartado "replies" de la collection User.

  me.data.replies.find(async (c: any) => {
    if (c.id == replyId) {
      c.likes -= 1;
    }
  });

  await tweetRef.push();
  if (user.data.generatedId == me.data.generatedId) {
    await me.push();
  } else {
    await me.push();
    await user.push();
  }
  return true;
}

export async function getLatestTweets() {
  const allTweets = await Tweets.getAll();
  const mutateDate = allTweets.map((tweet) => {
    const savedDate = tweet.createdAt;
    const date = new Date(
      savedDate._seconds * 1000 + savedDate._nanoseconds / 1000000
    );
    tweet.createdAt = date;
    return tweet;
  });

  const sortedByDate = [];
  mutateDate.filter((t, i) => {
    if (!isAfter(t.createdAt, mutateDate[i++].createdAt)) {
      sortedByDate.push(t);
    }
  });
  return sortedByDate;
}

export async function getTweetsWithMedia() {
  const allTweets = await Tweets.getAll();
  const result = allTweets.filter((t) => {
    if (t.img != "") {
      return t;
    }
  });
  return result;
}
