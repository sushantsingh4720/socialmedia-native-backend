import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import fs from "fs";
import {
  signUpBodyValidation,
  loginBodyValidation,
} from "../utils/validationSchema.js";
import sendCookie from "../utils/sendCookie.js";
import { getAllFollowers, getAllFollowing } from "../utils/apiFeatures.js";

// @route POST api/v1/user/register
// @desc  Register new user account
// @access Public
const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { error } = signUpBodyValidation({ name, email, password });
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(409)
        .json({ error: true, message: "User already exists" });
    user = { name, email, password };
    if (req.files) {
      let avatar = req.files.avatar.tempFilePath;
      const mycloud = await cloudinary.v2.uploader.upload(avatar, {
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
        folder: "userAvatar",
      });
      user = {
        ...user,
        avatar: { public_id: mycloud.public_id, url: mycloud.url },
      };
      fs.rmSync("./tmp", { recursive: true });
    }
    user = await User.create(user);
    sendCookie(user, res);
    res.status(201).json({
      success: true,
      user,
      message: "User successfully registered",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// @route POST api/v1/user/login
// @desc  user Login
// @access Public

const Login = async (req, res) => {
  try {
    const { error } = loginBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    let user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!user)
      return res
        .status(400)
        .json({ error: true, message: "User does not exist Please register" });
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password" });
    user = await User.findOne({ email: req.body.email });
    sendCookie(user, res);
    res.status(200).json({
      success: true,
      user,
      message: "login successfull",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// @route POST api/v1/user/logout
// @desc  logout
// @access login user access
const Logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// @route get api/v1/user/me
// @desc  get profile
// @access only authenticated user access this route
const Profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
// @route post api/v1/user/follow/:id
// @desc  follow a user
// @access only authenticated user access this route
const followUser = async (req, res) => {
  console.log(req.params.id, req.user._id);
  try {
    if (req.params.id === req.user._id)
      return res
        .status(400)
        .json({ error: true, message: "You can't follow yourself" });
    let user = await User.findById(req.user._id);
    let otheruser = await User.findById(req.params.id);
    if (!otheruser)
      return res
        .status(400)
        .json({ error: true, message: "Please provide a valid id" });

    const isFollowing = user.Following.some((following) => {
      return following.id.toString() === req.params.id.toString();
    });

    if (isFollowing) {
      return res
        .status(400)
        .json({ error: true, message: "You already follow this user" });
    }
    await user.updateOne({
      $push: { Following: { id: req.params.id } },
    });
    await otheruser.updateOne({
      $push: { Followers: { id: req.user._id } },
    });
    return res
      .status(200)
      .json({ success: true, message: "you follow this user" });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// @route put api/v1/user/unfollow/:id
// @desc  unFollow a user
// @access only authenticated user access this route
const unFollowUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id)
      return res
        .status(400)
        .json({ error: true, message: "You can't unfollow yourself" });
    let user = await User.findById(req.user._id);
    let otheruser = await User.findById(req.params.id);
    if (!otheruser)
      return res
        .status(400)
        .json({ error: true, message: "Please provide a valid id" });
    const isFollowing = user.Following.some((following) => {
      return following.id.toString() === req.params.id.toString();
    });

    if (!isFollowing) {
      return res
        .status(400)
        .json({ error: true, message: "You already unfollow this user" });
    }
    await user.updateOne({
      $pull: { Following: { id: req.params.id } },
    });
    await otheruser.updateOne({
      $pull: { Followers: { id: req.user._id } },
    });
    return res
      .status(200)
      .json({ success: true, message: "you unfollow this user" });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// @route get api/v1/user/allFollowFollowers
// @desc   get all follow and followers
// @access only authenticated user access this route
const getFollowFollowers = async (req, res) => {
  try {
    const allFollowers = await getAllFollowers({ req, res, _id: req.user._id });
    const allFollowing = await getAllFollowing({ req, res, _id: req.user._id });
    res.status(200).json({ success: true, allFollowers, allFollowing });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
// @route get api/v1/user/details/:id
// @desc   get specific user details
// @access authenticated user can access

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(400)
        .json({ error: true, message: "Please Provide valid user id" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
// @route get api/v1/user/search
// @desc   search a user by their email
// @access authenticated user can access
const searchUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res
        .status(400)
        .json({ error: true, message: "Please provide a search query" });
    const user = await User.find({ email: { $regex: email, $options: "i" } });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
// @route post api/v1/user/removefollower/:id
// @desc   remove a user from the followers list
// @access only authenticated user access this route
const removeFollower = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    const isAlreadyRemove = user.Followers.some((follower) => {
      return follower.id.toString() === req.params.id.toString();
    });
    if (!isAlreadyRemove)
      return res
        .status(400)
        .json({ error: true, message: "User already removed" });
    let Followers = await user.Followers.filter((follower) => {
      return follower.id !== req.params.id;
    });
    user.Followers = Followers;
    user.save();
    res.status(200).json({ success: true, message: "Successfully remove" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export {
  Signup,
  Login,
  Logout,
  Profile,
  followUser,
  unFollowUser,
  getUserDetails,
  searchUser,
  getFollowFollowers,
  removeFollower,
};
