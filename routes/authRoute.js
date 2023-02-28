import { Router } from "express";
import { Login, Logout, Signup } from "../controllers/userController.js";
const router = Router();
router.route("/register").post(Signup);
router.route("/login").post(Login);
router.route("/logout").get(Logout);
export default router;
