import { Router } from "express";
const router = Router();
import { Signup } from "../controllers/userController.js";
router.route("/user").post(Signup);

export default router;
