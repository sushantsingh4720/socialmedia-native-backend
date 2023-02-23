import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },

    avatar: {
      public_id: String,
      url: String,
    },
    Followers: [
      {
        id: {
          type: String,
          required: true,
        },
      },
    ],
    Following: [
      {
        id: {
          type: String,
          required: true,
        },
      },
    ],
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000,
  });
};
const User = mongoose.model("User", userSchema);
export default User;
