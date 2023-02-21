import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import fs from "fs";
import { signUpBodyValidation } from "../utils/validationSchema.js";
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
    res
      .status(201)
      .json({ success: true, user, message: "User successfully registered" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
export { Signup };
