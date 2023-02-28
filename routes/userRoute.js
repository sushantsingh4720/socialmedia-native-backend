import { Router } from "express";
const router = Router();
import {
  followUser,
  getAllUser,
  getFollowFollowers,
  getUserDetails,
  Profile,
  removeFollower,
  searchUser,
  unFollowUser,
} from "../controllers/userController.js";
router.route("/").get(getAllUser);
router.route("/me").get(Profile);
router.route("/search").get(searchUser);
router.route("/followfollowers").get(getFollowFollowers);
router.route("/follow/:id").post(followUser);
router.route("/unfollow/:id").put(unFollowUser);
router.route("/details/:id").get(getUserDetails);
router.route("/removefollower/:id").post(removeFollower);

export default router;
