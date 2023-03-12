import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import cloudinary from "cloudinary";
import fs from "fs";

// @route get api/v1/post
// @desc  get all users
// @access authenticated
const getAllPost = async (req, res) => {
  try {
    let allPosts = await Post.find().sort({ createdAt: -1 });
    const user = await User.findById(req.user._id);
    allPosts = allPosts.filter((post) => {
      return user.Following.some((item) => {
        {
          return (
            item.id.toString() === post.user.toString() ||
            req.user._id.toString() === post.user.toString()
          );
        }
      });
    });
    res.status(200).json({ success: true, allPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// @route post api/v1/post/new
// @desc  upload a new post
// @access authenticated
const uploadPost = async (req, res) => {
  try {
    if (!req.files)
      return res.status(400).json({ error: true, messaage: "File is missing" });
    let image = req.files.image.tempFilePath;
    const mycloud = await cloudinary.v2.uploader.upload(image, {
      width: 250,
      height: 250,
      gravity: "faces",
      crop: "fill",
      folder: "userPost",
    });

    fs.rmSync("./tmp", { recursive: true });
    let post = {
      ...req.body,
      user: req.user._id,
      image: { public_id: mycloud.public_id, url: mycloud.url },
    };
    await Post.create(post);

    res.status(201).json({ success: true, message: "successfully uploaded" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// @route post api/v1/post/me
// @desc  get all post uploaded by me
// @access authenticated
const getMyPost = async (req, res) => {
  try {
    const myPost = await Post.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, myPost });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { uploadPost, getAllPost, getMyPost };
