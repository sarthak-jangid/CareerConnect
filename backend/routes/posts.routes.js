import { Router } from "express";
import {
  activeCheck,
  commentOnPost,
  createPost,
  deleteComment,
  deletePost,
  get_comments_for_post,
  getAllPosts,
  getPostLike,
  likePost,
} from "../controllers/posts.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.route("/").get(activeCheck);

router.route("/createPost").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPosts);
router.route("/deletePost").delete(deletePost);
router.route("/likePost").post(likePost);
router.route("/getPostLike/:postId").get(getPostLike);
router.route("/commentOnPost").post(commentOnPost);
router.route("/getCommentsForPost").get(get_comments_for_post);
router.route("/deleteComment").delete(deleteComment);

export default router;
