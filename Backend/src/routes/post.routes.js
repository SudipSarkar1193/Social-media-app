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

import { ApiErrorResponseHandler } from "../middlewares/handleAPIErrorResponse.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";
const app = express();
const router = express.Router();

router.post("/create", authenticateUser, createPost, ApiErrorResponseHandler);
router.post(
	"/like/:postId",
	authenticateUser,
	likeUnlikePost,
	ApiErrorResponseHandler
);
router.post(
	"/comment/:postId",
	authenticateUser,
	commentOnPost,
	ApiErrorResponseHandler
);
router.delete("/:id", authenticateUser, deletePost);
router.get("/all", authenticateUser, getAllPosts);
router.get("/following", authenticateUser, getAllFollowingPosts);
router.get("/posts/:id", authenticateUser, validateObjectId, getUserPosts);
router.get("/likes/:id", authenticateUser, validateObjectId, getAllLikedPosts);

export default router;
