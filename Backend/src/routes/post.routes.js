import express from "express";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import {
	commentOnPost,
	createPost,
	deletePost,
	getAllFollowingPosts,
	getAllLikedPosts,
	getAllPosts,
	getUserPosts,
	likeUnlikePost,
} from "../controllers/post.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const app = express();
const router = express.Router();

router.post(
	"/create",
	authenticateUser,
	upload.fields([
		{
			name: "postImg",
			maxCount: 1,
		},
	]),
	createPost
);
router.post("/like/:postId", authenticateUser, likeUnlikePost);
router.post("/comment/:postId", authenticateUser, commentOnPost);
router.delete("/:id", authenticateUser, deletePost);
router.get("/all", authenticateUser, getAllPosts);
router.get("/following", authenticateUser, getAllFollowingPosts);
router.get("/posts/:username", authenticateUser, getUserPosts);
router.get("/likes/:id", authenticateUser, getAllLikedPosts);

export default router;
