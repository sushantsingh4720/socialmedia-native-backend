import { Router } from "express";
const router = Router();
import { Login, Signup } from "../controllers/userController.js";
router.route("/user/register").post(Signup);
router.route("/user/login").post(Login);

export default router;
