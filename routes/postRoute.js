import { Router } from "express";
import {
  getAllPost,
  getMyPost,
  uploadPost,
} from "../controllers/postController.js";
const router = Router();
router.route("/").get(getAllPost);
router.route("/new").post(uploadPost);
router.route("/me").get(getMyPost);
export default router;
