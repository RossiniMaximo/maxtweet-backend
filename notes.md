The user should be able to upload a profile pic , cover photo and a description apart from it's fullname.

To do :

Tengo que crear un inbox y conectarlo de alguna forma, Llamadas desde el cliente no siendo
atendidas

Requests notes :

user - patch : To Update the user's profile the request hasn't to contain all the fields, at the end
it is not necessary it will apply the changes to the given fields.

Tweets :
use findById to get a particular tweet.
use findAllByUserId when you are in your or other's profile.
The problem would be getting other users id's because its a private resource , maybe
looking for it using user's email.

User controller addFollower :
/\*
This was for checking if the user was already following not to add it , but I thinks it would
not affect because this endpoint is only going to be reached when you don't follow that other person,
because it will be controled by client side by follow or unfollow button.

const exists = userFollowed.data.followers.find((followerId) => {
return followerId == me.id;
});
if (exists == undefined) {
userFollowed.data.followers.push(me.id);
await userFollowed.push();
} \*/
