import User from "../models/userModel.js";
const getAllFollowing = async ({ req, res, _id }) => {
  let allUsers = await User.find();
  const { Following } = await User.findById(_id);

  let allFollowing = allUsers.filter((value) => {
    return Following.find((item) => {
      return value._id.toString() === item.id;
    });
  });
  allFollowing = allFollowing.map((value) => {
    return {
      _id: value._id,
      name: value.name,
      avatar: value.avatar,
      email: value.email,
    };
  });
  return allFollowing;
};
const getAllFollowers = async ({ req, res, _id }) => {
  let allUsers = await User.find();
  const { Followers } = await User.findById(_id);
  let allFollowers = allUsers.filter((value) => {
    return Followers.find((item) => {
      return value._id.toString() === item.id;
    });
  });
  allFollowers = allFollowers.map((item) => {
    return {
      _id: item._id,
      email: item.email,
      avatar: item.avatar,
    };
  });
  return allFollowers;
};
export { getAllFollowers, getAllFollowing };
