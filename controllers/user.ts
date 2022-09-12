import { User } from "models/user";
import { Auth } from "models/auth";
import { UserData } from "custom";
import { get_random } from "lib";

// If this layer  get to long I may separate it into smaller blocks.

export async function getMe(token) {
  const auth = new Auth(token);
  await auth.pull();
  const userId = auth.data.userId;
  const user = new User(userId);
  await user.pull();
  return user;
}

export async function updateUserProfile(updateBody, token) {
  const user = await getMe(token.authId);
  if (updateBody.newBody.email) {
    user.data.email = updateBody.newBody.email;
  }
  if (updateBody.newBody.fullname) {
    user.data.fullname = updateBody.newBody.fullname;
  }
  if (updateBody.newBody.description) {
    user.data.description = updateBody.newBody.description;
  }

  if (updateBody.newBody.pics.coverPicture) {
    user.data.pics.coverPicture = updateBody.newBody.pics.coverPicture;
  }
  if (updateBody.newBody.pics.profilePicture) {
    user.data.pics.profilePicture = updateBody.newBody.pics.profilePicture;
  }
  const updated = await user.push();
  return updated;
}

// Adds following to user making the request and a follower to followed user.

export async function addFollower(followedId: number, authId) {
  // First , it gets the user following reference by the authId,then the followed user reference
  // by followedId param obtained using the url in the frontend,
  // to access their following and followers properties.
  const me = await getMe(authId);
  me.data.following.push(Number(followedId));
  await me.push();
  const userFollowed = await User.findById(followedId);
  userFollowed.data.followers.push(Number(me.data.generatedId));
  await userFollowed.push();
  return true;
}

// Decreases your following count and the unfollowed's followers count
// Also deletes the unfollowed's tweets from your feed.
export async function handleUnfollow(unfollowedId, authId) {
  // Here removes tweets from feed.
  const me = await getMe(authId);
  me.data.feed.map(async (tweet: any, index) => {
    if (tweet.userId == unfollowedId) {
      me.data.feed.splice(index, 1);
    }
    await me.push();
  });

  // Here  removes the unfollowed user from our following list.
  const unfollowedIndex = me.data.following.find((ids) => ids == unfollowedId);
  const indexOfUserResult = me.data.following.indexOf(unfollowedIndex);
  if (indexOfUserResult > -1) {
    me.data.following.splice(indexOfUserResult, 1);
    await me.push();
  }

  // Here removes us from unfollowed's  followers list.

  const unfollowedUser = await User.findById(unfollowedId);
  await unfollowedUser.pull();

  const unfollowedUserResult = unfollowedUser.data.followers.find(
    (ids) => ids == me.data.generatedId
  );
  const indexOfMeInUnfollowedFollowers =
    unfollowedUser.data.followers.indexOf(unfollowedUserResult);
  if (indexOfMeInUnfollowedFollowers > -1) {
    unfollowedUser.data.followers.splice(indexOfMeInUnfollowedFollowers, 1);
    await unfollowedUser.push();
  }
  return true;
}

export async function getUserFeed(authId) {
  const user = await getMe(authId);
  return user.data.feed;
}

// Guarda el tweet en nuestra data en el atributo like o save cuando le damos like o save a algun tweet.
export async function saveAction(action, tweet, token) {
  const user = await getMe(token);
  if (action == "like") {
    user.data.likes.find(async (t: any) => {
      if (t.id == tweet.data.id) {
        // console.log("hay otro igual");
        return false;
      } else if (t.id != undefined) {
        // console.log("no habia otro igual");
        user.data.likes.push(tweet.data);
        await user.push();
      }
    });
  }
  if (action == "save") {
    user.data.saves.find(async (t: any) => {
      if (t.id == tweet.data.id) {
        return false;
      } else {
        user.data.saves.push(tweet.data);
        await user.push();
      }
    });
  }
}

export async function getAllTweetsFromUser(userId: number) {
  const user = await User.findById(userId);
  return user.data.tweets;
}

export async function getOthersProfile(userId: number) {
  const result = await User.findById(userId);
  return result?.data;
}

// This function was crashing every time because of the for loop , It was falling
// into recursion because I was looping until the array length  had 2 elements but It may never have to.
export async function getWhoToFollow(token) {
  const me = await getMe(token.authId);
  const usersList = await User.getAll();

  let arr = [];
  let newArr = [];
  // Fix this shit
  for (let i = 0; i < 2; i++) {
    const randomUser = usersList.map((user) => {
      return user;
    });

    me.data.following.map((followed) => {
      if (followed == randomUser[i].generatedId) {
        return;
      } else if (arr[0]?.generatedId == randomUser[i].generatedId) {
        // Chequea si ya se ha metido un elemento identico al array previamente.
        return;
      } else {
        //  No existe tanto en following como en el array.
        arr.push(randomUser[i]);
        return true;
      }
    });
  }
  /*   for (const user of arr) {
    console.log(user.fullname);
  } */

  return arr;
}

export async function getAllUsers(query: string) {
  const users = await User.getAll();
  const result = users.filter((user) => {
    if (user.fullname.includes(query)) {
      return user;
    }
  });
  return result;
}

export async function get10RandomsUsers() {
  const allUsers = await User.getAll();

  const allRandoms = [];
  for (let index = 0; index < 10; index++) {
    const random = allUsers[Math.floor(Math.random() * allUsers.length)];
    allRandoms.push(random);
  }
  return allRandoms;
}

function compareFunction(a, b) {
  return b.followers.length - a.followers.length;
}

export async function getMostFollowedUsers() {
  // Bring users and compare their followers length to sort them
  //  use .sort()
  const users = await User.getAll();
  const sliceData = users.map((user) => {
    return {
      fullname: user.fullname,
      userId: user.generatedId,
      followers: user.followers,
      description: user.description,
      pics: {
        profilePicture: user.pics.profilePicture,
      },
    };
  });
  const sortedUsers = sliceData.sort(compareFunction as any);
  return sortedUsers;
}
