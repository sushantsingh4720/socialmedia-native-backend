import { Router } from "express";
import { Login, Signup } from "../controllers/userController.js";
const router = Router();
router.route("/register").post(Signup);
router.route("/login").post(Login);
export default router;
