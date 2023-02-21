import { Router } from "express";
const router = Router();
import { Signup } from "../controllers/userController.js";
router.route("/user/register").post(Signup);

export default router;
