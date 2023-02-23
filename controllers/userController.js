import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import fs from "fs";
import {
  signUpBodyValidation,
  loginBodyValidation,
} from "../utils/validationSchema.js";
import sendCookie from "../utils/sendCookie.js";

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

    const isFollowing = otheruser.Followers.some((follower) => {
      return follower.id.toString() === user._id.toString();
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
    const isFollowing = otheruser.Followers.some((follower) => {
      return follower.id.toString() === user._id.toString();
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

// @route get api/v1/user/allFollowing
// @desc   get all user to follow
// @access only authenticated user access this route
const getAllFollowing = async (req, res) => {
  try {
    let allUsers = await User.find();
    const { Following } = await User.findById(req.user._id);

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
    res.status(200).json({ success: true, allFollowing });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// @route get api/v1/user/allFollowers
// @desc   get all followers
// @access only authenticated user access this route
const getAllFollowers = async (req, res) => {
  try {
    let allUsers = await User.find();
    const { Followers } = await User.findById(req.user._id);
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
    res.status(200).json({ success: true, allFollowers });
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
export {
  Signup,
  Login,
  Logout,
  Profile,
  followUser,
  unFollowUser,
  getAllFollowing,
  getAllFollowers,
  getUserDetails,
  searchUser,
};
