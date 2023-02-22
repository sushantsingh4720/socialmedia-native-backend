import { Router } from "express";
const router = Router();
import {
  Login,
  Logout,
  Profile,
  Signup,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
router.route("/user/register").post(Signup);
router.route("/user/login").post(Login);
router.route("/user/logout").post(Logout);
router.route("/user/me").get(authMiddleware, Profile);
export default router;
