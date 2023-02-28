import mongoose from "mongoose";
import User from "./userModel.js";
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    title: {
      type: String,
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    video: {
      public_id: String,
      url: String,
    },
    like: {
      type: Array,
    },
    dislike: {
      type: Array,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: User,
          required: true,
        },
        profile: {
          name: { type: String, required: true },
          email: { type: String, required: true },
          avatar: { type: String, required: true },
        },
        comment: {
          type: String,
          required: true,
        },
      },
      { timestamps: true },
    ],
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", postSchema);
export default Post;
