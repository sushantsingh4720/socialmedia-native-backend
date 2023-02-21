import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import fs from "fs";
import {
  signUpBodyValidation,
  loginBodyValidation,
} from "../utils/validationSchema.js";

// @route POST api/user/register
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
    res.status(201).json({
      success: true,
      user,
      message: "User successfully registered",
      token: user.getJWTToken(),
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// @route POST api/user/login
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
    res.status(200).json({
      success: true,
      user,
      message: "login successfull",
      token: user.getJWTToken(),
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export { Signup, Login };
console.log();
