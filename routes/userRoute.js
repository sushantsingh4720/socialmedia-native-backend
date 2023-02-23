import { Router } from "express";
const router = Router();
import {
  followUser,
  getAllFollowers,
  getAllFollowing,
  getUserDetails,
  Logout,
  Profile,
  searchUser,
  unFollowUser,
} from "../controllers/userController.js";

router.route("/user/logout").get(Logout);
router.route("/user/me").get(Profile);
router.route("/user/follow/:id").post(followUser);
router.route("/user/unfollow/:id").put(unFollowUser);
router.route("/user/allFollowing").get(getAllFollowing);
router.route("/user/allFollowers").get(getAllFollowers);
router.route("/user/details/:id").get(getUserDetails);
router.route("/user/search").get(searchUser);

export default router;
