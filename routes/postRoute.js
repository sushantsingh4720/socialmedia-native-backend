import { Router } from "express";
import { getAllPost, uploadPost } from "../controllers/postController.js";
const router = Router();
router.route("/").get(getAllPost);
router.route("/new").post(uploadPost);
export default router;
